# Multi-site VPS topology

Tek VPS'te birden fazla site/uygulamayı izole şekilde host etmek için kullanılan yapı. Portfolio bu topology'nin bir parçası olarak deploy edilir.

## Topology

```
┌──── Internet ────┐
│ 80, 443 (HTTPS) │
└──────────────────┘
         ↓
┌────────── VPS (Linux + Docker) ────────────────────────────────────┐
│                                                                     │
│  ┌─ /opt/infra/ ──────────────────────────────────────────────┐    │
│  │ Caddy reverse proxy (tek SSL + tek 80/443 portu)          │    │
│  │ Caddyfile import sites/*.caddyfile                         │    │
│  └──────┬─────────────────────────────────────────────────────┘    │
│         │                                                           │
│         │ Docker network: web (external, paylaşılan)               │
│         │                                                           │
│   ┌─────┼──────────────────────────────────────┐                   │
│   │     │                                       │                   │
│   ↓     ↓                                       ↓                   │
│  /opt/portfolio/         /opt/vault/         /opt/site3/           │
│  ┌──────────────┐        ┌──────────────┐    ┌──────────────┐      │
│  │ app:3001     │        │ api:3200     │    │ app:8080     │      │
│  │ db (private) │        │ db (private) │    │ ...          │      │
│  │              │        │              │    │              │      │
│  │ network:     │        │ network:     │    │ network:     │      │
│  │  - internal  │        │  - internal  │    │  - internal  │      │
│  │  - web ←─────┼────────┼─ web ←───────┼────┼─ web ←──────┘      │
│  └──────────────┘        └──────────────┘    └──────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Prensip

| Katman | Sorumluluk |
|---|---|
| **Caddy** (infra) | Tek 80/443 dinleyici, tüm SSL'leri yönetir, domain → container reverse proxy |
| **Site stack** (her proje) | Kendi app + db + volume'leri; iç network'te konuşur; sadece app `web` network'üne çıkar |
| **Site-level DB** | Site'a özel, başka site'lar erişemez; `internal` network'te |
| **Volume'ler** | Her site kendi volume'lerinde (`portfolio-prod-db`, `vault-data`, vs.) — izole |

## Avantajları

- **Tek SSL yönetimi** — Caddy hepsini Let's Encrypt'ten otomatik alır ve yeniler
- **Tek 80/443 portu** — VPS firewall basit, başka site eklerken port açmaya gerek yok
- **Site izolasyonu** — bir site'ın DB'sine diğer site erişemez (`internal` network ayrı)
- **Bağımsız deploy** — her site'ı ayrı ayrı update edebilirsin, diğerlerini etkilemez
- **Bağımsız kaynak** — bir site memory leak yapsa diğeri çalışmaya devam eder
- **Site eklemek/kaldırmak kolay** — yeni klasör + yeni site config + reload

## İlk kurulum (VPS'te)

### Adım 1: Infra'yı kur (sadece bir kez)

```bash
# Repo'yu VPS'e taşı (örnek: portfolio repo'sunda infra-example/ var)
mkdir -p /opt/infra
# infra-example/ içeriğini /opt/infra/ altına kopyala (scp, rsync, git, vs.)

cd /opt/infra
cp .env.example .env
nano .env   # ADMIN_EMAIL'i değiştir
nano sites/portfolio.caddyfile   # domain'i değiştir

# Caddy kalk + web network oluştur
docker compose up -d
docker compose logs -f caddy   # SSL alımı gözle
```

### Adım 2: İlk site'ı kur (portfolio örneği)

```bash
git clone <portfolio-repo> /opt/portfolio
cd /opt/portfolio
cp .env.production.example .env
nano .env   # tüm değerleri doldur

chmod +x deploy.sh db-backup.sh
./deploy.sh --bootstrap
```

Hazır — site `https://portfolio.your-domain.com`'da yayında.

## Yeni site eklemek (sonradan)

Diyelim ikinci bir Next.js sitesini host etmek istiyorsun, `https://blog.your-domain.com`. 3 adımda:

### Adım 1: Site'ı VPS'e koy
```bash
git clone <blog-repo> /opt/blog
cd /opt/blog
# Compose ve env'yi hazırla — portfolio'daki pattern'i kopyala
```

Compose'unda dikkat edilecek noktalar:
```yaml
services:
  app:
    container_name: blog-prod-app    # uniqu isim
    networks:
      - internal
      - web                          # paylaşılan
    expose:
      - "3000"                       # portu BURADA expose et (host'a açma)
  db:
    networks:
      - internal                     # sadece site'ın iç network'ünde

networks:
  internal:
    driver: bridge
  web:
    external: true
    name: web
```

### Adım 2: Caddy config ekle
```bash
nano /opt/infra/sites/blog.caddyfile
```
```caddy
blog.your-domain.com {
    encode zstd gzip
    reverse_proxy blog-prod-app:3000
}
```

### Adım 3: DNS + reload + deploy
```bash
# DNS A: blog.your-domain.com → VPS IP

# Caddy config reload (zero downtime)
cd /opt/infra
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile

# Site'ı kaldır
cd /opt/blog
docker compose up -d
```

Site `https://blog.your-domain.com`'da yayında, Caddy otomatik SSL alır.

## Site kaldırmak

```bash
# 1. Site'ı durdur (volume'leri silmek istemiyorsan)
cd /opt/blog
docker compose down

# 2. Caddy config'ten kaldır
rm /opt/infra/sites/blog.caddyfile
cd /opt/infra
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile

# 3. (Opsiyonel) Volume'leri sil — kalıcı veri kaybı
cd /opt/blog
docker compose down -v   # ⚠️ DB ve uploads silinir
rm -rf /opt/blog
```

## Kapasite — kaç site host edilebilir?

| VPS plan | RAM | Tahmini site sayısı | Not |
|---|---|---|---|
| 1 GB RAM | 1 GB | 1-2 küçük site | Sıkışık, swap gerekir |
| 2 GB RAM | 2 GB | 2-3 site | Portfolio + 1 statik + 1 küçük dynamic |
| 4 GB RAM | 4 GB | 3-5 site | Portfolio gibi her biri Postgres'li 2-3 dynamic + birkaç statik |
| 8 GB RAM | 8 GB | 5-8 site | Comfortable, monitoring + büyük site'lar dahil |

Her dynamic site (Node + Postgres) tipik 300-600 MB RAM. Static site'lar (sadece Caddy file_server) çok az kaynak.

## Disk kullanımı

| Şey | Tipik boyut |
|---|---|
| Docker engine + base image'lar | 1-2 GB |
| Her site image | 500 MB - 1 GB |
| Postgres DB (küçük site) | 50-500 MB |
| Caddy data (SSL sertifikaları) | < 10 MB |
| Backup'lar | Günde 50-200 MB (rotation ile sınırlı) |

40 GB SSD bir VPS'te 5-6 site rahat host edilebilir.

## Network izolasyonu — neden önemli?

- Site A'nın container'ı, Site B'nin DB'sine ulaşamaz (farklı `internal` network'lerde)
- Caddy hepsine ulaşır çünkü `web` network'ünde
- Site A bir zafiyete sahip olursa Site B'nin DB credentials'ına dokunamaz
- DB hostname her site'ta `db` olabilir (kendi network'ünde unique) — name conflict yok

## Bilinen sınırlar

- **Tek IP** — tüm site'lar aynı VPS IP'sinde, SNI ile ayrılır (HTTPS standart)
- **Tek SSL daemon** — Caddy down olursa tüm siteler down
- **Tek node arıza alanı** — bu plan single VPS; HA (yüksek erişilebilirlik) için multi-VPS + load balancer gerekir
- **Disk ve RAM ortak** — bir site'ın leak'i diğerlerini etkileyebilir (`docker stats` ile izle)

## İleri seviye (opsiyonel)

### Caddy auto-discovery (caddy-docker-proxy)
Manual `sites/*.caddyfile` yazmak yerine container label'larıyla otomatik discover:
- Site container'ına `caddy: blog.your-domain.com` ve `caddy.reverse_proxy: "{{upstreams 3000}}"` label'ları ekle
- Manuel Caddyfile reload gerekmez

Trade-off: debug zorlaşır, log net olmaz. Bu projede manuel pattern tercih edildi.

### Cloudflare proxy
Her site için Cloudflare DNS proxy on → DDoS koruması + edge cache. Cloudflare → Caddy SSL mode: **Full (strict)**.

### Monitoring
Tek VPS'te:
- **Uptime Kuma** container — `monitor.your-domain.com` ile yine `infra/sites/`'a ekle, port 3001 yerine başka iç port
- **Netdata** — sistem metrikleri (CPU, RAM, disk, network)
- Hepsini aynı Caddy + `web` network pattern'i ile expose edebilirsin
