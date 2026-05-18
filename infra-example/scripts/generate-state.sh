#!/usr/bin/env bash
# infra/scripts/generate-state.sh
#
# Infra (Caddy + web network) durumunu INFRA-STATE.md dosyasına yazar.
# Manuel veya cron ile çalıştırılabilir: ./scripts/generate-state.sh [reason]
#
# Üretilen INFRA-STATE.md gitignored (VPS'te kalıcı, lokal'de değil).
#
set -euo pipefail

INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$INFRA_DIR"

REASON="${1:-manual}"
STATE_FILE="INFRA-STATE.md"

NOW_UTC="$(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# Load .env
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# --- Caddy container ---
CADDY_STATUS="$(docker inspect infra-caddy --format '{{.State.Status}}' 2>/dev/null || echo 'not-running')"
CADDY_HEALTH="$(docker inspect infra-caddy --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' 2>/dev/null || echo 'n/a')"
CADDY_STARTED="$(docker inspect infra-caddy --format '{{.State.StartedAt}}' 2>/dev/null | cut -d'.' -f1 | sed 's/T/ /' || echo 'n/a')"
CADDY_IMAGE="$(docker inspect infra-caddy --format '{{.Config.Image}}' 2>/dev/null || echo 'n/a')"

# --- web network ---
WEB_NET_EXISTS="hayır"
WEB_NET_CONTAINERS=""
if docker network inspect web > /dev/null 2>&1; then
  WEB_NET_EXISTS="evet"
  WEB_NET_CONTAINERS="$(docker network inspect web --format '{{range .Containers}}- {{.Name}}{{"\n"}}{{end}}' 2>/dev/null)"
fi

# --- Site config'leri ---
SITES_LIST=""
if [ -d sites ]; then
  for f in sites/*.caddyfile; do
    [ -e "$f" ] || continue
    domain_line="$(grep -m 1 -oE '^[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+(,\s*[a-zA-Z0-9.-]+)*\s*\{' "$f" | sed 's/[[:space:]]*{//' || echo '(parse hatası)')"
    backend_line="$(grep -m 1 'reverse_proxy' "$f" | awk '{print $2}' || echo '(yok)')"
    SITES_LIST+="| $(basename "$f") | ${domain_line} | ${backend_line} |"$'\n'
  done
fi
if [ -z "$SITES_LIST" ]; then
  SITES_LIST="| _(sites/ klasöründe .caddyfile yok)_ | — | — |"
fi

# --- SSL certificates (caddy data volume) ---
SSL_CERT_DOMAINS=""
if [ "$CADDY_STATUS" = "running" ]; then
  SSL_CERT_DOMAINS="$(docker compose exec -T caddy sh -c 'ls /data/caddy/certificates/acme-v02.api.letsencrypt.org-directory/ 2>/dev/null || true' | tr -d '\r')"
fi

# --- Caddy config validation ---
CADDY_CONFIG_VALID="n/a"
if [ "$CADDY_STATUS" = "running" ]; then
  if docker compose exec -T caddy caddy validate --config /etc/caddy/Caddyfile > /dev/null 2>&1; then
    CADDY_CONFIG_VALID="✓ valid"
  else
    CADDY_CONFIG_VALID="✗ invalid (caddy validate ile detay)"
  fi
fi

# --- Disk ---
DISK_USAGE="$(df -h "$INFRA_DIR" | awk 'NR==2 {print $3 " / " $2 " (" $5 ")"}')"

# --- Write state file ---
cat > "$STATE_FILE" <<EOF
# Infra State

> **⚠️ Otomatik üretildi** — \`./scripts/generate-state.sh\` ile güncellenir.
> Manuel düzenleme yapma; bir sonraki çalıştırmada üzerine yazılır.
>
> **Amaç**: Merkezi Caddy + paylaşılan \`web\` network durumunu özetler.
> VPS'te birden fazla site host edildiğinde "neyin nerede olduğu" net olur.

| Alan | Değer |
|---|---|
| Son güncelleme | $NOW_UTC |
| Sebep | $REASON |
| Admin email (Let's Encrypt) | ${ADMIN_EMAIL:-unset} |

## Caddy container

| Alan | Değer |
|---|---|
| Container | infra-caddy |
| Status | $CADDY_STATUS |
| Health | $CADDY_HEALTH |
| Image | $CADDY_IMAGE |
| Started at | $CADDY_STARTED |
| Caddyfile valid | $CADDY_CONFIG_VALID |

## \`web\` external network

| Alan | Değer |
|---|---|
| Network mevcut | $WEB_NET_EXISTS |

### Bağlı container'lar
$WEB_NET_CONTAINERS

> Bir site Caddy'den erişilemiyorsa, **container'ı \`web\` network'üne bağlı mı**
> kontrol et. Site compose'unda \`networks: web: external: true, name: web\` olmalı.

## Aktif site config'leri

| Dosya | Domain | Reverse proxy hedefi |
|---|---|---|
$SITES_LIST

## SSL sertifikaları

\`\`\`
$SSL_CERT_DOMAINS
\`\`\`

> Bu klasörler Let's Encrypt'ten alınmış aktif sertifikalardır. Boşsa
> SSL hiç alınmamış (henüz site'a istek gelmemiş veya DNS hatası).

## Sistem kaynak

| Alan | Değer |
|---|---|
| Disk (/opt/infra) | $DISK_USAGE |

## Komutlar (sık kullanılan)

| Operasyon | Komut |
|---|---|
| Caddy log | \`docker compose logs -f caddy\` |
| Caddy config reload (zero downtime) | \`docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile\` |
| Caddy config validate | \`docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile\` |
| Aktif config görüntüle | \`docker compose exec caddy caddy adapt --config /etc/caddy/Caddyfile --pretty\` |
| State yenile | \`./scripts/generate-state.sh\` |
| Yeni site ekle | sites/<isim>.caddyfile oluştur + Caddy reload (detay: ../MULTI-SITE.md) |

## Bir sonraki müdahale için ipuçları

- Bir site'a erişim yok / "502 bad gateway" → \`web\` network bağlantısı kontrol
- Caddy yanıt vermiyor → \`docker compose logs caddy | tail -50\`
- SSL alamadı → DNS propagation + firewall (80/443 açık mı)
- \`web\` network silinmiş → \`docker compose up -d\` (otomatik oluşturur)
- Yeni site ekleme → MULTI-SITE.md "Yeni site eklemek" bölümü

---

> İlgili: [../MULTI-SITE.md](../MULTI-SITE.md), [./README.md](README.md)
EOF

echo "→ $STATE_FILE güncellendi ($REASON)"
