#!/usr/bin/env bash
# Portfolio production deploy script (run on the VPS)
#
# Usage:
#   ./deploy.sh                # pull latest, rebuild app image, recreate container (DATA SAFE)
#   ./deploy.sh --no-pull      # skip git pull (deploy uncommitted local changes)
#   ./deploy.sh --bootstrap    # also run prisma seed (yalnız boş tablolar dolar)
#
# DATA SAFETY:
# - Postgres + uploads + demos + downloads kalıcı Docker volume'lerinde.
# - "docker compose up -d" recreate yapsa bile volume'lere dokunmaz.
# - Migration'lar additive (yeni alanlar/tablolar) → mevcut veri korunur.
# - Seed script IDEMPOTENT: yalnız boş tabloları doldurur, dolu olanlara dokunmaz.
#   --bootstrap'i yanlışlıkla tekrar çalıştırsanız bile admin paneli verisi kaybolmaz.
#
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

PULL=1
BOOTSTRAP=0
for arg in "$@"; do
  case "$arg" in
    --no-pull)   PULL=0 ;;
    --bootstrap) BOOTSTRAP=1 ;;
    --seed)
      echo "⚠️  --seed kaldırıldı. İlk kurulum için --bootstrap kullanın." >&2
      exit 1
      ;;
    *) echo "Unknown arg: $arg" >&2; exit 1 ;;
  esac
done

if [ ! -f .env ]; then
  echo "ERROR: .env yok. .env.production.example'i kopyalayıp düzenle." >&2
  exit 1
fi

if [ "$PULL" -eq 1 ] && [ -d .git ]; then
  echo "→ git pull"
  git pull --ff-only
fi

echo "→ docker compose build app"
docker compose -f docker-compose.production.yml build app

echo "→ docker compose up -d (rolling, volumes kalıcı)"
docker compose -f docker-compose.production.yml up -d

if [ "$BOOTSTRAP" -eq 1 ]; then
  echo ""
  echo "→ Bootstrap seed (yalnız boş tablolar doldurulur)"
  echo "   Mevcut admin paneli verisi korunur."
  docker compose -f docker-compose.production.yml exec -T app npx tsx prisma/seed.ts
fi

echo ""
echo "→ Health check"
sleep 5
HEALTH_OK=0
for i in $(seq 1 30); do
  if docker compose -f docker-compose.production.yml exec -T app curl -fsS http://127.0.0.1:3001/ > /dev/null; then
    echo "✓ App is healthy"
    HEALTH_OK=1
    break
  fi
  sleep 2
done

# DEPLOY-STATE.md'yi her durumda üret (sağlıksız olsa bile — teşhis için lazım)
if [ -x "./scripts/generate-state.sh" ]; then
  REASON_LABEL="deploy.sh"
  if [ "$BOOTSTRAP" -eq 1 ]; then REASON_LABEL="deploy.sh --bootstrap"; fi
  if [ "$HEALTH_OK" -eq 0 ]; then REASON_LABEL="${REASON_LABEL} [health FAILED]"; fi
  ./scripts/generate-state.sh "$REASON_LABEL" || true
fi

if [ "$HEALTH_OK" -eq 0 ]; then
  echo "✗ App health check timed out — 'docker compose logs app' ile incele" >&2
  echo "  DEPLOY-STATE.md güncellendi, sistem durumu için ona bak" >&2
  exit 1
fi

exit 0
