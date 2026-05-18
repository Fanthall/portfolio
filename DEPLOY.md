# Portfolio — Production Deploy Kılavuzu

Bu kılavuz, portfolio'yu kendi VPS'inde Docker + merkezi Caddy reverse proxy ile yayına almak için adım adım rehber.

> **Multi-site topology kullanılıyor**: aynı VPS'te birden fazla site host etmek için Caddy ayrı bir stack'te (`/opt/infra/`). Detaylar için [MULTI-SITE.md](MULTI-SITE.md).

## Gereksinimler

- **VPS**: 2 GB+ RAM, 20 GB+ SSD, Linux (Ubuntu 22.04/24.04 veya Debian 12 önerilir)
  - Provider farketmez (Hetzner, Contabo, DigitalOcean, Vultr, herhangi bir bulut / kendi sunucu)
  - 4 GB RAM önerilir eğer birden fazla site host edeceksen
- **Domain**: A kayıt (apex + www veya subdomain) VPS IP'sine yönlendirilmiş

## 1. VPS hazırlığı (tek seferlik)

SSH ile bağlan:
```bash
ssh root@your-vps-ip
```

### 1.1 Sistem güncelle + temel araçlar
```bash
apt update && apt upgrade -y
apt install -y git curl ufw
```

### 1.2 Firewall (sadece SSH + HTTP + HTTPS)
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp     # HTTP/3 (QUIC)
ufw --force enable
```

### 1.3 Docker + Docker Compose
```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
```

(Opsiyonel) Root olmayan kullanıcıdan docker çalıştırmak istersen:
```bash
adduser deploy
usermod -aG docker deploy
# Sonraki adımları deploy kullanıcısıyla yap
```

## 2. Merkezi reverse proxy (infra) kurulumu — sadece bir kez

Bu adım, **ilk site'tan önce** veya **ilk site'la birlikte** yapılır. Tek seferlik.

### 2.1 infra klasörünü VPS'e koy

Portfolio repo'sundaki `infra-example/` klasörünü `/opt/infra/` olarak kopyala:

```bash
mkdir -p /opt/infra

# Yöntem A: portfolio'yu clone et + infra-example'ı kopyala
cd /tmp && git clone <portfolio-repo-url> portfolio-temp
cp -r portfolio-temp/infra-example/. /opt/infra/
rm -rf portfolio-temp

# Yöntem B: scp ile yerel'den gönder
# scp -r ./portfolio/infra-example/. root@vps-ip:/opt/infra/
```

### 2.2 Env + site config

```bash
cd /opt/infra
cp .env.example .env
nano .env   # ADMIN_EMAIL'i değiştir

nano sites/portfolio.caddyfile   # your-domain.com → gerçek domain
```

### 2.3 Caddy'yi kaldır

```bash
docker compose up -d
docker compose logs -f caddy   # SSL alımı gözle (ilk istek geldiğinde)
```

Bu komut **`web` adlı external Docker network'ünü oluşturur**. Sonraki site'lar bu network'e bağlanacak.

## 3. Portfolio'yu deploy et

### 3.1 Repo + env

```bash
git clone <portfolio-repo> /opt/portfolio
cd /opt/portfolio
cp .env.production.example .env
nano .env
```

**Doldurulması zorunlu alanlar:**
- `NEXT_PUBLIC_SITE_URL` — `https://portfolio.your-domain.com`
- `POSTGRES_PASSWORD` — güçlü rastgele (`openssl rand -base64 24`)
- `JWT_SECRET` — güçlü rastgele (`openssl rand -base64 48`)
- `ADMIN_BOOTSTRAP_EMAIL` — admin email
- `ADMIN_BOOTSTRAP_PASSWORD` — admin için ilk şifre

```bash
chmod 600 .env   # Sadece sahibi okuyabilsin
```

### 3.2 İlk deploy

```bash
chmod +x deploy.sh db-backup.sh
./deploy.sh --bootstrap
```

Bu komut:
1. App image build eder (~2-3 dakika ilk seferinde)
2. Postgres + app container'larını başlatır (Caddy zaten ayrı stack'te çalışıyor)
3. Prisma migration uygular
4. Admin user + about content + sample data seed eder
5. Health check yapar

App container `web` external network'üne bağlanır → Caddy `portfolio-prod-app:3001`'e ulaşabilir → SSL alır.

## 4. DNS

Domain registrar panelinde:
- **A** record: `portfolio` (veya `@`) → VPS IPv4
- **A** record: `www` veya `www.portfolio` (apex kullanılıyorsa) → VPS IPv4
- (Opsiyonel) **AAAA** record IPv6

Propagation için: `dig portfolio.your-domain.com +short` çıktısında VPS IP'sini gör.

## 5. Doğrulama

```bash
# Container'lar healthy mi?
cd /opt/infra && docker compose ps
cd /opt/portfolio && docker compose -f docker-compose.production.yml ps

# Loglar (Ctrl+C ile çık)
docker compose -f docker-compose.production.yml logs -f app

# Caddy'nin doğru reverse proxy yaptığını test et
curl -I https://portfolio.your-domain.com
curl https://portfolio.your-domain.com/robots.txt
```

Admin'e giriş: `https://portfolio.your-domain.com/admin/login` → `.env`'deki bootstrap email + şifre

## 6. Backup (otomatik)

```bash
crontab -e
```

Şu satırı ekle (her gece 03:00):
```
0 3 * * * /opt/portfolio/db-backup.sh >> /var/log/portfolio-backup.log 2>&1
```

14 günden eski yedekleri otomatik siler. Yedekler `/opt/portfolio/backups/` altına `.sql.gz` olarak yazılır.

**Off-site backup** (önerilir): rsync ile başka makineye sync et veya rclone ile S3/B2/R2'ye kopyala.

```bash
# rsync örneği
rsync -avz /opt/portfolio/backups/ user@backup-host:/backup/portfolio/
```

## 7. Update / yeniden deploy

Yerel'de değişiklik yapıp git push'tan sonra:

```bash
ssh root@your-vps-ip
cd /opt/portfolio
./deploy.sh
```

Bu git pull + rebuild + rolling restart yapar. Downtime ~5-10 saniye (container restart süresi).

### Data safety (kritik)

**Redeploy'da veri korunur — birden fazla katmandan korumalı:**

| Katman | Davranış |
|---|---|
| Postgres data | `portfolio-prod-db` named volume — `docker compose up` / `build` / `restart` **dokunmaz**. Sadece `docker compose down -v` (yani `--volumes`) ile silinir. |
| Uploads / demos / downloads | `portfolio-uploads`, `portfolio-demos`, `portfolio-downloads` named volume'lar — aynı koruma. |
| Caddy SSL sertifikaları | `/opt/infra/` stack'inde `caddy-data` volume'unda — site redeploy'larda korunur. |
| Prisma migrations | Container start'ta `prisma migrate deploy` — yalnız **yeni** migration'ları uygular, mevcut tablolara/satırlara dokunmaz. Destructive migration (kolon drop) yazılırsa o tabii ki veri kaybı yapar, bu nedenle migration'lar dikkatli yazılmalı. |
| Seed script | **IDEMPOTENT**: yalnız boş tabloları doldurur. `--bootstrap` flag'ini yanlışlıkla tekrar çalıştırsanız bile admin'den eklenen Career, Project, Message vs. **silinmez**. |

**Doğrulama**: `docker volume ls` ile volume'ları listele; `portfolio-prod-db` ve diğerleri görünmeli.

### Yanlışlıkla "down" yapmaktan kaçınma

```bash
# GÜVENLİ — container'ları durdurur, volume'lere dokunmaz
docker compose -f docker-compose.production.yml stop

# GÜVENLİ — container'ları durdurur ve siler, volume'ler kalır
docker compose -f docker-compose.production.yml down

# TEHLİKELİ — ⚠️ tüm volume'leri SİLER, data kaybı!
docker compose -f docker-compose.production.yml down -v        # ← ASLA
docker compose -f docker-compose.production.yml down --volumes # ← AYNI ŞEY
```

### Migration güvenliği

Yeni alan eklerken: nullable veya default değer ver. Production'da `prisma migrate dev` **çalıştırma** — sadece `prisma migrate deploy` (container otomatik yapar).

Destructive değişiklik (kolon adı değişimi, type değişimi, kolon drop) gerekiyorsa:
1. Yerel'de migration üret (`prisma migrate dev`)
2. **Önce backup al** (`./db-backup.sh`)
3. Test ortamında uygula
4. Sonra production'a deploy et

### Backup'tan restore

Catastrophic veri kaybında (yanlışlıkla `down -v`, donanım arızası vs.):

```bash
# 1. Compose'u up et (boş DB ile başlasın)
./deploy.sh

# 2. Backup dosyasını seç ve restore et
gunzip -c /opt/portfolio/backups/portfolio-YYYYMMDD-HHMMSS.sql.gz | \
  docker compose -f docker-compose.production.yml exec -T db \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

# 3. Uploaded files restore edilmeli (varsa rsync backup'tan)
```

> ⚠️ Bu yüzden **off-site backup şart**: `db-backup.sh` lokal dosya üretir; gerçek koruma için yedekleri başka makineye/storage'a kopyalanan rsync/rclone cron'u eklenmeli.

## 8. Aynı VPS'e başka site eklemek

[MULTI-SITE.md](MULTI-SITE.md) — "Yeni site eklemek" bölümüne bak. Kısaca:

```bash
# 1. Site'ı /opt/<isim>/ altına koy
# 2. Compose'unda `web` external network'üne bağla (örnek için portfolio compose'una bak)
# 3. /opt/infra/sites/<isim>.caddyfile oluştur
# 4. cd /opt/infra && docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
# 5. DNS A kaydı + cd /opt/<isim> && docker compose up -d
```

## 9. Cloudflare proxy (opsiyonel, önerilir)

DDoS koruması + edge cache için Cloudflare DNS kullan:
1. Domain'i Cloudflare nameserver'larına geçir
2. A kayıtlarında proxy turunu **aç** (turuncu bulut)
3. SSL/TLS mode: **Full (strict)** — Caddy'den gelen sertifika ile uyumlu
4. **Rules → Always Use HTTPS** aç
5. (Opsiyonel) Page Rules ile `/uploads/*`, `/demos/*`, `/_next/static/*` için aggressive cache

Cloudflare aktifken: `header_up X-Forwarded-For` Caddy'de zaten doğru — gerçek istemci IP'si app'e ulaşır.

## 10. Sorun giderme

### Caddy SSL alamadı
```bash
cd /opt/infra
docker compose logs caddy
```
- DNS propagation tamamlanmamış olabilir (`dig portfolio.your-domain.com`)
- 80/443 portları açık değil (`ufw status`)
- Site'ın container'ı `web` network'ünde değil (`docker network inspect web`)

### "no upstream" / "502 bad gateway"
Site app container'ı `web` network'üne bağlı değil veya Caddyfile'daki container ismi (`portfolio-prod-app`) ile eşleşmiyor.

```bash
docker network inspect web   # bağlı container'ları listele
```

### App container restart döngüsünde
```bash
cd /opt/portfolio
docker compose -f docker-compose.production.yml logs app
```
Genelde sebep: `.env` eksik/yanlış değer, DB bağlantı sorunu, infra stack down (web network yok).

### Disk dolduğunda
Eski Docker image'larını temizle:
```bash
docker system prune -a
```
(⚠️ Volume'lara dokunmaz ama kullanılmayan image'ları siler.)

## Özet

```bash
# === İlk kurulum (tek seferlik) ===

# A. VPS bootstrap
ssh root@vps-ip
curl -fsSL https://get.docker.com | sh
ufw allow 22,80,443/tcp && ufw allow 443/udp && ufw --force enable

# B. Infra (merkezi reverse proxy)
mkdir /opt/infra
# infra-example/ içeriğini /opt/infra/'a kopyala
cd /opt/infra
cp .env.example .env && nano .env
nano sites/portfolio.caddyfile
docker compose up -d

# C. Portfolio
git clone <repo> /opt/portfolio
cd /opt/portfolio
cp .env.production.example .env && nano .env
chmod +x deploy.sh db-backup.sh
./deploy.sh --bootstrap

# === Sonraki update'ler ===
ssh root@vps-ip
cd /opt/portfolio
./deploy.sh

# === Yeni site eklemek ===
# 1. /opt/<yeni-site>/ ile site'ı kur (web network'üne bağla)
# 2. /opt/infra/sites/<yeni-site>.caddyfile oluştur
# 3. cd /opt/infra && docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
# 4. DNS A kaydı + cd /opt/<yeni-site> && docker compose up -d
```
