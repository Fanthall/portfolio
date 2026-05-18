#!/usr/bin/env bash
# Portfolio Postgres backup script
#
# Cron örnek (her gece 03:00):
#   0 3 * * * /opt/portfolio/db-backup.sh >> /var/log/portfolio-backup.log 2>&1
#
# 14 günden eski yedekleri otomatik siler.
#
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/portfolio/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$BACKUP_DIR"

# .env'den POSTGRES_* değerlerini oku
set -a
# shellcheck disable=SC1091
source "$PROJECT_DIR/.env"
set +a

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="$BACKUP_DIR/portfolio-${TIMESTAMP}.sql.gz"

echo "→ Dump → $OUT_FILE"
docker compose -f "$PROJECT_DIR/docker-compose.production.yml" exec -T db \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  | gzip > "$OUT_FILE"

# Cleanup
echo "→ ${RETENTION_DAYS} günden eski yedekleri sil"
find "$BACKUP_DIR" -name "portfolio-*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete

echo "✓ Backup complete ($(du -h "$OUT_FILE" | cut -f1))"

# DEPLOY-STATE.md'yi güncelle (backup bilgilerini yansıt)
if [ -x "$PROJECT_DIR/scripts/generate-state.sh" ]; then
  ( cd "$PROJECT_DIR" && ./scripts/generate-state.sh "db-backup.sh" ) || true
fi
