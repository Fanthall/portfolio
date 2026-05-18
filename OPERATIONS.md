# Operations — Sistem Durumu, State Dosyaları, Komut Haritası

Bu dosya VPS'te koşan sistemi izlemek ve sürdürmek için referans noktası.
**Her müdahaleden önce ilgili state dosyasını oku** — sistemin son fotoğrafını
görmeden komut çalıştırmak hata yapma olasılığını artırır.

## Otomatik üretilen state dosyaları

Sistem her önemli operasyonda kendi durumunu özetleyen iki dosya üretir:

| Dosya | Konum (VPS'te) | Üretiliyor | İçerik |
|---|---|---|---|
| `DEPLOY-STATE.md` | `/opt/portfolio/` | `deploy.sh`, `db-backup.sh`, `scripts/generate-state.sh` | Portfolio container'ları, migration durumu, DB içerik özeti, volume kullanımı, backup, env, kaynak kullanımı |
| `INFRA-STATE.md` | `/opt/infra/` | `infra-example/scripts/generate-state.sh` | Caddy durumu, `web` network'üne bağlı container'lar, aktif site config'leri, SSL sertifikaları |

Her ikisi de `.gitignore`'da — VPS'te kalıcı, repo'ya gitmez.

## Ne zaman okumalı?

### Bir müdahale yapmadan önce ⭐ (en kritik)
```bash
# Portfolio'ya müdahale
cat /opt/portfolio/DEPLOY-STATE.md

# Infra'ya müdahale (Caddy / site routing)
cat /opt/infra/INFRA-STATE.md
```

Bunu bir AI'a verirsen, "şu sistemi yönet" dediğinde **bu dosyayı önce okumasını söyle**. Kör müdahale olmaz.

### Sorun yaşandığında
- App down → `cat DEPLOY-STATE.md` → `APP_STATUS` ne, restart count yüksek mi, son deploy ne zaman
- Site açılmıyor → `cat INFRA-STATE.md` → `web` network'te container var mı, Caddy config valid mi
- DB sorgusu cevapsız → DEPLOY-STATE.md → `DB_STATUS`, migration counts uyuyor mu

### Periyodik kontrol
- Haftalık state yenile: `cd /opt/portfolio && ./scripts/generate-state.sh weekly-check`
- Bu komut sistemde değişiklik yapmaz, sadece state'i güncel okur

## Komut → state etkisi tablosu

| Komut | Ne yapar | State'e etkisi |
|---|---|---|
| `./deploy.sh` | git pull + build + recreate | DEPLOY-STATE.md güncellenir |
| `./deploy.sh --bootstrap` | + seed (idempotent) | DEPLOY-STATE.md güncellenir |
| `./db-backup.sh` | DB dump | DEPLOY-STATE.md backup bölümü güncellenir |
| `./scripts/generate-state.sh [reason]` | Sadece state üretir | DEPLOY-STATE.md güncellenir |
| `docker compose -f ... up -d` | Container recreate | State **güncellenmez** (manuel `generate-state.sh` çalıştır) |
| `docker compose -f ... restart app` | Sadece restart | State **güncellenmez** |
| `cd /opt/infra && docker compose exec caddy caddy reload ...` | Caddy config reload | INFRA-STATE.md **güncellenmez** (manuel çalıştır) |

> Pratik kural: Docker'a doğrudan müdahale ettiyse `generate-state.sh`'ı manuel çalıştır.

## VPS klasör haritası (tipik kurulum)

```
/opt/
├── infra/                          ← /opt/infra/
│   ├── docker-compose.yml          (Caddy stack)
│   ├── Caddyfile                   (global config + sites/ import)
│   ├── .env                        (ADMIN_EMAIL)
│   ├── sites/
│   │   ├── portfolio.caddyfile
│   │   ├── vault.caddyfile         (örnek — ek site)
│   │   └── ...
│   ├── scripts/
│   │   └── generate-state.sh
│   └── INFRA-STATE.md              ← otomatik üretilen
│
├── portfolio/                      ← /opt/portfolio/
│   ├── docker-compose.production.yml
│   ├── Dockerfile
│   ├── .env                        (production secrets)
│   ├── deploy.sh
│   ├── db-backup.sh
│   ├── scripts/
│   │   └── generate-state.sh
│   ├── backups/                    (DB dump rotation)
│   │   ├── portfolio-20260513-030001.sql.gz
│   │   └── ...
│   ├── DEPLOY-STATE.md             ← otomatik üretilen
│   └── (Next.js source, public/, prisma/, ...)
│
└── <başka-site>/                   ← /opt/<isim>/
    ├── docker-compose.yml
    ├── ...
    └── ...
```

## Docker resource haritası

### Network'ler
| Name | Tip | Sahibi | Bağlı container'lar |
|---|---|---|---|
| `web` | bridge, external | infra (oluşturucu) | caddy + tüm site app container'ları |
| `portfolio_internal` | bridge | portfolio compose | portfolio app + db |
| `<site>_internal` | bridge | her site kendi compose'unda | site app + db |

### Volumes (portfolio için)
| Volume | İçerik | Kalıcılık |
|---|---|---|
| `portfolio_portfolio-prod-db` | PostgreSQL data | Kalıcı — sadece `down -v` siler |
| `portfolio_portfolio-uploads` | Admin upload resimleri | Kalıcı |
| `portfolio_portfolio-demos` | Demo HTML zip extract'leri | Kalıcı |
| `portfolio_portfolio-downloads` | Installer dosyaları | Kalıcı |

### Volumes (infra için)
| Volume | İçerik | Kalıcılık |
|---|---|---|
| `infra_caddy-data` | SSL sertifikaları (Let's Encrypt) | Kalıcı — silinirse cert yeniden alınır (rate limit riski) |
| `infra_caddy-config` | Caddy runtime config cache | Yenilenebilir |

### Container isim çakışmasını önleme
Her site uniq `container_name` kullanmalı:
- `portfolio-prod-app`, `portfolio-prod-db` (portfolio)
- `vault-prod-app`, `vault-prod-db` (örnek başka site)
- `infra-caddy` (Caddy)

## Sık operasyonlar

### Sağlıklı bir update deploy'u
```bash
cd /opt/portfolio
./deploy.sh
# State otomatik güncellenir, sonra:
cat DEPLOY-STATE.md
```

### State'i manuel yenile (Docker'a elle müdahale ettiysen)
```bash
cd /opt/portfolio
./scripts/generate-state.sh "manual after docker restart"
```

### Tüm sistem durumunu hızlı tara
```bash
# Tek satırlık panorama
cd /opt/infra && cat INFRA-STATE.md | head -30
cd /opt/portfolio && cat DEPLOY-STATE.md | head -30
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
df -h
```

### Yeni AI/operatör'e devretme
1. SSH bilgilerini ver
2. "Önce `/opt/portfolio/DEPLOY-STATE.md` ve `/opt/infra/INFRA-STATE.md` oku" de
3. AI okuduktan sonra sistem fotoğrafını anlamış olur, sorularına net cevap verebilir
4. Komut çalıştırmadan önce yine state'i oku — değişiklik kontrolü

## State dosyalarının format garantisi

Markdown'da sabit başlıklar var, AI bunları parse edebilir:
- `## Container durumu` — tablo: servis, status, health, restart count
- `## Network` — `web` bağlantı durumu
- `## Volume kullanımı` — boyutlar
- `## Prisma migrations` — uygulanmış migration listesi
- `## DB içerik özeti` — tablo satır sayıları
- `## Backup` — son backup zamanı + dosya boyutu

Format değişirse `generate-state.sh` tek noktada güncellenir; tüm parser'lar düzeltilir.

## Sınırlar

State dosyaları:
- ✅ Anlık fotoğraf — son `generate-state.sh` çalıştırma anının durumu
- ❌ **Canlı izleme değil** — gerçek zamanlı monitoring için UptimeRobot, Netdata vs.
- ❌ **Geçmiş tutmaz** — her çalıştırma üzerine yazar (geçmiş için git'te commit'lenirse versionable olurdu ama VPS-only)
- ❌ **DB içeriğinin tamamı yok** — sadece satır sayıları, anonim metadata; gerçek veri için backup

## İleri seviye

### State'i HTTP üzerinden expose etmek (opsiyonel, admin'e)
İstersen `DEPLOY-STATE.md`'yi Caddy üzerinden `https://portfolio.your-domain.com/admin/state` gibi auth-protected bir yere serve edebilirsin. Şu an sadece SSH'tan görünür — bu çoğu zaman yeterli.

### Cron ile periyodik state üretimi
```bash
# /opt/portfolio/ ve /opt/infra/ için saatlik state yenileme
crontab -e
# Ekle:
0 * * * * /opt/portfolio/scripts/generate-state.sh "hourly-cron" >> /var/log/portfolio-state.log 2>&1
0 * * * * /opt/infra/scripts/generate-state.sh "hourly-cron" >> /var/log/infra-state.log 2>&1
```

### State'i Slack/Discord'a push
`generate-state.sh` sonunda webhook ile özetin ilk N satırını gönder:
```bash
curl -X POST -H 'Content-Type: application/json' \
  -d "{\"text\": \"$(head -20 DEPLOY-STATE.md)\"}" \
  "$DISCORD_WEBHOOK_URL"
```
