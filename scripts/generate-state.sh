#!/usr/bin/env bash
# generate-state.sh
#
# Portfolio sistem durumunu DEPLOY-STATE.md dosyasına yazar.
# - deploy.sh sonunda otomatik çağrılır
# - db-backup.sh sonunda otomatik çağrılır
# - Manuel olarak da çalıştırılabilir: ./scripts/generate-state.sh [reason]
#
# Üretilen DEPLOY-STATE.md gitignored — VPS'te kalıcı, lokal'de değil.
# Bu dosya başka bir AI ajanına/operatöre sistem fotoğrafını verir; sonraki
# müdahalelerde "kör" hareket etmemek için referans alınır.
#
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

REASON="${1:-manual}"
COMPOSE_FILE="docker-compose.production.yml"
STATE_FILE="DEPLOY-STATE.md"

# --- Helpers ---------------------------------------------------------------

mask_secret() {
  if [ -z "${1:-}" ]; then echo "[unset]"; return; fi
  echo "[hidden, ${#1} chars]"
}

# Load .env safely (only KEY=VALUE pairs, ignore comments)
load_env() {
  if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
  fi
}

trim() {
  # Strip CR/LF and surrounding whitespace
  printf '%s' "$1" | tr -d '\r\n' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g'
}

# Container metadata (returns "not-running" / "n/a" if not present)
container_status() {
  local result
  result=$(docker inspect "$1" --format '{{.State.Status}}' 2>/dev/null || true)
  [ -z "$result" ] && result="not-running"
  trim "$result"
}

container_health() {
  local result
  result=$(docker inspect "$1" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' 2>/dev/null || true)
  [ -z "$result" ] && result="n/a"
  trim "$result"
}

container_started_at() {
  local result
  result=$(docker inspect "$1" --format '{{.State.StartedAt}}' 2>/dev/null || true)
  if [ -z "$result" ] || [ "$result" = "0001-01-01T00:00:00Z" ]; then
    echo "n/a"
  else
    trim "$(echo "$result" | cut -d'.' -f1 | sed 's/T/ /')"
  fi
}

container_restart_count() {
  local result
  result=$(docker inspect "$1" --format '{{.RestartCount}}' 2>/dev/null || true)
  [ -z "$result" ] && result="n/a"
  trim "$result"
}

container_image() {
  local result
  result=$(docker inspect "$1" --format '{{.Config.Image}}' 2>/dev/null || true)
  [ -z "$result" ] && result="n/a"
  trim "$result"
}

volume_size() {
  local result
  result=$(docker run --rm -v "$1:/data" alpine du -sh /data 2>/dev/null | awk '{print $1}' || true)
  [ -z "$result" ] && result="?"
  trim "$result"
}

# DB query (returns empty if not reachable)
db_query() {
  docker compose -f "$COMPOSE_FILE" exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tA -c "$1" 2>/dev/null || echo ""
}

# --- Collect data ----------------------------------------------------------

load_env

NOW_UTC="$(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# Git
if [ -d .git ]; then
  GIT_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo 'n/a')"
  GIT_MSG="$(git log -1 --pretty=%s 2>/dev/null || echo 'n/a')"
  GIT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'n/a')"
  GIT_DIRTY="$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
else
  GIT_COMMIT="no-git"
  GIT_MSG=""
  GIT_BRANCH=""
  GIT_DIRTY="0"
fi

# Containers
APP_STATUS="$(container_status portfolio-prod-app)"
APP_HEALTH="$(container_health portfolio-prod-app)"
APP_STARTED="$(container_started_at portfolio-prod-app)"
APP_RESTARTS="$(container_restart_count portfolio-prod-app)"
APP_IMAGE="$(container_image portfolio-prod-app)"

DB_STATUS="$(container_status portfolio-prod-db)"
DB_HEALTH="$(container_health portfolio-prod-db)"
DB_STARTED="$(container_started_at portfolio-prod-db)"
DB_RESTARTS="$(container_restart_count portfolio-prod-db)"

# Volumes
VOL_DB_SIZE="$(volume_size portfolio_portfolio-prod-db)"
VOL_UPLOADS_SIZE="$(volume_size portfolio_portfolio-uploads)"
VOL_DEMOS_SIZE="$(volume_size portfolio_portfolio-demos)"
VOL_DOWNLOADS_SIZE="$(volume_size portfolio_portfolio-downloads)"

# Migrations (only if DB reachable)
MIGRATIONS_APPLIED=""
MIGRATIONS_COUNT_FS="$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')"
if [ "$DB_STATUS" = "running" ]; then
  MIGRATIONS_APPLIED="$(db_query "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL ORDER BY started_at;" | head -50)"
fi

# DB content summary (only if DB reachable)
COUNT_ADMIN=""
COUNT_ABOUT=""
COUNT_CAREER=""
COUNT_PROJECT=""
COUNT_PROJECT_FEATURED=""
COUNT_MESSAGE=""
COUNT_MESSAGE_UNREAD=""
COUNT_PAGESEO=""
COUNT_PAGESEO_OVERRIDE=""
COUNT_PAGESEO_NOINDEX=""
if [ "$DB_STATUS" = "running" ]; then
  COUNT_ADMIN="$(db_query 'SELECT count(*) FROM "AdminUser";')"
  COUNT_ABOUT="$(db_query 'SELECT count(*) FROM "AboutContent";')"
  COUNT_CAREER="$(db_query 'SELECT count(*) FROM "WorkExperience";')"
  COUNT_PROJECT="$(db_query 'SELECT count(*) FROM "Project";')"
  COUNT_PROJECT_FEATURED="$(db_query 'SELECT count(*) FROM "Project" WHERE "isFeatured"=true;')"
  COUNT_MESSAGE="$(db_query 'SELECT count(*) FROM "ContactMessage";')"
  COUNT_MESSAGE_UNREAD="$(db_query 'SELECT count(*) FROM "ContactMessage" WHERE "isRead"=false;')"
  COUNT_PAGESEO="$(db_query 'SELECT count(*) FROM "PageSeo";')"
  COUNT_PAGESEO_OVERRIDE="$(db_query 'SELECT count(*) FROM "PageSeo" WHERE "titleTr" IS NOT NULL OR "titleEn" IS NOT NULL OR "descriptionTr" IS NOT NULL OR "descriptionEn" IS NOT NULL OR "ogImage" IS NOT NULL;')"
  COUNT_PAGESEO_NOINDEX="$(db_query 'SELECT count(*) FROM "PageSeo" WHERE "noIndex"=true;')"
fi

# Backups
BACKUPS_DIR="backups"
BACKUP_COUNT=0
LAST_BACKUP=""
LAST_BACKUP_SIZE=""
if [ -d "$BACKUPS_DIR" ]; then
  BACKUP_COUNT="$(find "$BACKUPS_DIR" -maxdepth 1 -name "portfolio-*.sql.gz" 2>/dev/null | wc -l | tr -d ' ')"
  LAST_BACKUP_FILE="$(find "$BACKUPS_DIR" -maxdepth 1 -name "portfolio-*.sql.gz" -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)"
  if [ -n "$LAST_BACKUP_FILE" ]; then
    LAST_BACKUP="$(basename "$LAST_BACKUP_FILE")"
    LAST_BACKUP_SIZE="$(du -h "$LAST_BACKUP_FILE" | cut -f1)"
  fi
fi

# Disk + RAM
DISK_USAGE="$(df -h "$PROJECT_DIR" | awk 'NR==2 {print $3 " / " $2 " (" $5 ")"}')"
RAM_USAGE="$(free -h 2>/dev/null | awk 'NR==2 {print $3 " / " $2}' || echo 'n/a (free komutu yok)')"
DOCKER_DISK="$(docker system df --format '{{.Size}}' 2>/dev/null | head -1 || echo 'n/a')"

# Network
WEB_NETWORK_EXISTS="hayır"
APP_ON_WEB="hayır"
if docker network inspect web > /dev/null 2>&1; then
  WEB_NETWORK_EXISTS="evet"
  if docker network inspect web --format '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null | grep -q "portfolio-prod-app"; then
    APP_ON_WEB="evet"
  fi
fi

# Site URL + HTTP check
SITE_URL="${NEXT_PUBLIC_SITE_URL:-unset}"
SITE_HTTP="n/a"
if [ "$APP_STATUS" = "running" ]; then
  SITE_HTTP="$(docker compose -f "$COMPOSE_FILE" exec -T app curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/ 2>/dev/null || echo 'unreachable')"
fi

# --- Write state file ------------------------------------------------------

cat > "$STATE_FILE" <<EOF
# Portfolio Deploy State

> **⚠️ Otomatik üretildi** — \`./scripts/generate-state.sh\` (deploy.sh ve db-backup.sh
> sonunda çağrılır). Manuel düzenleme yapma; bir sonraki çalıştırmada üzerine yazılır.
>
> **Amaç**: VPS'te sistemin son durumunu özetler. Sonraki müdahalelerde (sen veya
> bir AI ajanı) bu dosyayı okuyup mevcut durumu anlar, kör müdahale önlenir.

| Alan | Değer |
|---|---|
| Son güncelleme | $NOW_UTC |
| Sebep | $REASON |
| Site URL | $SITE_URL |
| App HTTP check | $SITE_HTTP |

## Git

| Alan | Değer |
|---|---|
| Branch | $GIT_BRANCH |
| Commit | $GIT_COMMIT |
| Message | $GIT_MSG |
| Uncommitted changes | $GIT_DIRTY |

## Container durumu

| Servis | Container | Status | Health | Restart count | Started at | Image |
|---|---|---|---|---|---|---|
| app | portfolio-prod-app | $APP_STATUS | $APP_HEALTH | $APP_RESTARTS | $APP_STARTED | $APP_IMAGE |
| db | portfolio-prod-db | $DB_STATUS | $DB_HEALTH | $DB_RESTARTS | $DB_STARTED | postgres:16-alpine |

## Network

| Alan | Değer |
|---|---|
| \`web\` external network mevcut | $WEB_NETWORK_EXISTS |
| App \`web\` network'ünde | $APP_ON_WEB |

> \`web\` external network'ü \`/opt/infra/\` (infra-example/ deploy edilmiş klasör)
> tarafından oluşturulur. Eğer "hayır" görüyorsan: \`cd /opt/infra && docker compose up -d\`

## Volume kullanımı

| Volume | Boyut | Açıklama |
|---|---|---|
| portfolio_portfolio-prod-db | $VOL_DB_SIZE | PostgreSQL data |
| portfolio_portfolio-uploads | $VOL_UPLOADS_SIZE | Admin upload görselleri |
| portfolio_portfolio-demos | $VOL_DEMOS_SIZE | Demo HTML zip extract'leri |
| portfolio_portfolio-downloads | $VOL_DOWNLOADS_SIZE | Installer dosyaları |

## Prisma migrations

- Filesystem'de tanımlı: **$MIGRATIONS_COUNT_FS** migration
- DB'de uygulanmış:
\`\`\`
$MIGRATIONS_APPLIED
\`\`\`

## DB içerik özeti

| Tablo | Toplam | Not |
|---|---|---|
| AdminUser | $COUNT_ADMIN | Admin panel giriş hesabı sayısı |
| AboutContent | $COUNT_ABOUT | Singleton (1 olmalı) |
| WorkExperience | $COUNT_CAREER | Kariyer kayıtları |
| Project | $COUNT_PROJECT | ${COUNT_PROJECT_FEATURED:-?} öne çıkan |
| ContactMessage | $COUNT_MESSAGE | ${COUNT_MESSAGE_UNREAD:-?} okunmamış |
| PageSeo | $COUNT_PAGESEO | ${COUNT_PAGESEO_OVERRIDE:-?} özel override, ${COUNT_PAGESEO_NOINDEX:-?} noIndex |

## Backup

| Alan | Değer |
|---|---|
| Backup klasörü | \`$BACKUPS_DIR/\` |
| Toplam backup dosyası | $BACKUP_COUNT |
| Son backup | ${LAST_BACKUP:-yok} |
| Son backup boyutu | ${LAST_BACKUP_SIZE:-n/a} |

## Sistem kaynak

| Alan | Değer |
|---|---|
| Disk (proje yolu) | $DISK_USAGE |
| RAM (sistem) | $RAM_USAGE |
| Docker toplam disk | $DOCKER_DISK |

## Çevre değişkenleri

| Değişken | Değer |
|---|---|
| NODE_ENV | ${NODE_ENV:-unset} |
| NEXT_PUBLIC_SITE_URL | ${NEXT_PUBLIC_SITE_URL:-unset} |
| POSTGRES_DB | ${POSTGRES_DB:-unset} |
| POSTGRES_USER | ${POSTGRES_USER:-unset} |
| POSTGRES_PASSWORD | $(mask_secret "${POSTGRES_PASSWORD:-}") |
| JWT_SECRET | $(mask_secret "${JWT_SECRET:-}") |
| JWT_TTL_SECONDS | ${JWT_TTL_SECONDS:-unset} |
| ADMIN_BOOTSTRAP_EMAIL | ${ADMIN_BOOTSTRAP_EMAIL:-unset} |
| ADMIN_BOOTSTRAP_PASSWORD | $(mask_secret "${ADMIN_BOOTSTRAP_PASSWORD:-}") |

> Secret'lar maskelendi. Gerçek değerler için sadece \`.env\` dosyasına bak.

## Son komut özeti

Bu dosyanın üretilmesine sebep olan komut: **$REASON**

| Operasyon | Komut | Etki |
|---|---|---|
| Standart deploy | \`./deploy.sh\` | git pull + image rebuild + container recreate, **veri korunur** |
| Bootstrap | \`./deploy.sh --bootstrap\` | Standart deploy + seed (idempotent — boş tabloları doldurur) |
| Manuel backup | \`./db-backup.sh\` | DB dump → backups/ |
| State yenile | \`./scripts/generate-state.sh\` | Sadece bu dosyayı günceller (sistemde değişiklik yapmaz) |

## Bir sonraki adım için ipuçları

- Yeni bir AI/operatör müdahale edecekse **önce bu dosyayı oku**, sistemin tam fotoğrafını al
- Sorunları gör (örn. APP_STATUS != "running") → \`docker compose -f docker-compose.production.yml logs app\`
- Backup eski → \`./db-backup.sh\` elle çalıştır
- App restart count > 5 → loop var, \`docker logs\` ile teşhis
- Uncommitted changes > 0 → VPS'te local değişiklik var, commit edilmemiş

---

> Dosya formatı / state alanları için: [OPERATIONS.md](OPERATIONS.md)
EOF

# stdout ipucu
echo "→ $STATE_FILE güncellendi ($REASON)"
