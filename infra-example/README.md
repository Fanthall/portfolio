# infra — VPS reverse proxy stack

Bu klasör, aynı VPS'te birden fazla site host etmek için merkezi Caddy reverse proxy kurulumudur. Her site kendi compose stack'inde çalışır, hepsi `web` adlı paylaşılan Docker network'ünden Caddy'ye ulaşır.

## Kurulum (VPS'te, ilk seferlik)

```bash
# 1. Bu klasörü VPS'te /opt/infra/ olarak kopyala
#    (rsync, scp veya manuel git'ten clone)

# 2. .env oluştur
cp .env.example .env
nano .env   # ADMIN_EMAIL'i değiştir

# 3. Site config'leri kopyala/düzenle
nano sites/portfolio.caddyfile   # your-domain.com → gerçek domain

# 4. Caddy stack'i kaldır (web network'ünü oluşturur)
docker compose up -d

# 5. Durumu kontrol et
docker compose ps
docker compose logs -f caddy
```

İlk istek geldiğinde Caddy Let's Encrypt'ten SSL sertifikası alır (~30 saniye gecikme).

## Site eklemek

Her site için 2 dosya gerekir:
1. **Site config**: `sites/<isim>.caddyfile`
2. **Site compose**: ayrı klasörde, `web` external network'üne bağlı

### Adım adım yeni site

```bash
# 1. Yeni site config dosyası
nano sites/vault.caddyfile
# İçeriği (örnek):
#   vault.your-domain.com {
#       reverse_proxy passwordmanagement-api:3200
#   }

# 2. Caddy reload (Caddy yeniden başlatmadan config'i okur)
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile

# 3. DNS A kaydını VPS IP'sine yönlendir (vault.your-domain.com)

# 4. Yeni site'ın compose'unda `web` network'üne bağlandığından emin ol:
#    networks:
#      web:
#        external: true
#        name: web

# 5. Yeni site'ı kaldır
cd /opt/vault   # veya site klasörü
docker compose up -d

# 6. Test
curl -I https://vault.your-domain.com
```

## Klasör yapısı

```
infra/
├── docker-compose.yml      # Caddy servisi + web network tanımı
├── Caddyfile               # Global ayarlar + sites/*.caddyfile import
├── .env                    # ADMIN_EMAIL (gitignored)
├── .env.example            # Şablon
├── sites/
│   ├── portfolio.caddyfile           # Aktif site config
│   ├── vault.caddyfile               # (örnek) ek site
│   └── example-static.caddyfile.template   # Şablon — sil veya kopyala
└── README.md               # Bu dosya
```

## Sık komutlar

```bash
# Caddyfile değişikliğini reload et (zero downtime)
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile

# Aktif config'i görüntüle
docker compose exec caddy caddy adapt --config /etc/caddy/Caddyfile

# Caddy log
docker compose logs -f caddy

# Caddy + ağ durumu
docker compose ps
docker network inspect web

# SSL sertifika listesi
docker compose exec caddy ls /data/caddy/certificates/acme-v02.api.letsencrypt.org-directory/
```

## Önemli notlar

### `web` network sırası
- `infra` ilk kalkmalı, çünkü `web` network'ünü o oluşturur
- Sonra her site compose'u → `web`'e external olarak bağlanır
- Eğer `infra` down olursa siteler de Caddy'e ulaşılamaz (ama container'lar ayakta kalır)

### Caddy data volume
`caddy-data` volume'ünde SSL sertifikaları durur. Bu volume **silinmemeli** — silinirse her site için sertifika yeniden istenir (Let's Encrypt rate limit: domain başına haftalık 50 cert).

### Yeni domain için DNS propagation
DNS A kaydını eklediğinde Caddy ilk isteği aldığında sertifika ister. Propagation tamamlanmadan istek gelirse sertifika başarısız olabilir; 5-30 dk bekle, sonra `curl -I https://yeni-domain.com` ile dene.

### Network çakışması
Eğer aynı isimli `web` network'ü zaten varsa (örn. başka projeden), `docker network ls | grep web` ile bul, sil veya farklı isim kullan (`Caddyfile` + compose ikisinde de güncelle).

### Backup
Caddy data volume'ünü periyodik yedekle:
```bash
docker run --rm -v infra_caddy-data:/data -v $(pwd):/backup alpine \
  tar -czf /backup/caddy-data-$(date +%Y%m%d).tar.gz -C /data .
```

## Sorun giderme

### "no upstream resolved" hatası
Site container'ı `web` network'ünde değil veya container_name yanlış. `docker network inspect web` ile bağlı container'ları kontrol et.

### SSL alamadı
- DNS doğru mu? (`dig yeni-domain.com +short` → VPS IP)
- 80 ve 443 port'ları açık mı? (`ufw status`)
- Caddy log: `docker compose logs caddy | grep -i error`

### Hangi container hangi domain'i serve ediyor?
```bash
docker compose exec caddy caddy adapt --config /etc/caddy/Caddyfile --pretty | grep -A 2 "subjects"
```
