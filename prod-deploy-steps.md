# Production Deploy — Analiz, Karar Matrisi ve Adım Akışı

> Bu belge `DEPLOY.md`'den farklı. `DEPLOY.md` **nasıl yapılır** (komut komut rehber); bu dosya **ne yapacaksın, neden, ne kadar sürer, neye karar vermen lazım, ne kadara mal olur** sorularının cevabı. Deploy günü hem bu dosyayı hem DEPLOY.md'yi yan yana aç.

> **Topology**: Aynı VPS'te birden fazla site host etmek için **merkezi Caddy reverse proxy** pattern'i kullanılır. Caddy ayrı bir stack'te (`/opt/infra/`), her site (portfolio, vault, vb.) ayrı klasörde. Detay: [MULTI-SITE.md](MULTI-SITE.md). İlk site portfolio'dur; sonradan ek site eklemek basit.

---

## 0. Bir bakışta

| Soru | Cevap |
|---|---|
| Toplam ilk-kurulum süresi | **~2-3 saat** (VPS hesabı + DNS + infra + portfolio) |
| Aktif çalışma | ~1-1.5 saat (komutlar + doğrulama) |
| Tek site host yeterince RAM | 2 GB |
| Birden fazla site için RAM | 4-8 GB |
| Aylık VPS maliyeti aralığı | **€3-15** (provider seçimine bağlı) |
| Domain | €9-15/yıl |
| Toplam ilk yıl maliyeti | **€50-100** |
| Downtime risk (sonraki deploy'larda) | ~5-10 sn (rolling restart) |
| Veri kaybı riski (redeploy) | **Sıfır** (idempotent seed + persistent volumes) |
| SSL yönetimi | Otomatik (Caddy + Let's Encrypt, merkezi) |
| Backup | Lokal otomatik (cron) + off-site (sen ayarlamalı) |
| Aynı VPS'te ekstra site eklemek | ~15-30 dk per site |

---

## 1. Pre-deploy hazırlık checklist

### 1.1 Kararlar (bu dökümanın §3'üne bak)
- [ ] **Hosting provider** seçildi
- [ ] **Domain adı** kayıtlı (veya alınacak) + subdomain stratejisi (`portfolio.domain.com` vs `domain.com`)
- [ ] **Cloudflare** kullanılacak mı (DNS + DDoS) — önerilir
- [ ] **Backup** stratejisi netleşti (off-site kopyalama)
- [ ] **Aynı VPS'te kaç site planı** (1 mi, 3-5 mi, daha fazlası mı?)
- [ ] **Email** (contact form notification) — şu an YOK, sonraya bırakılabilir

### 1.2 Kaynaklar
- [ ] Kredi kartı (VPS + domain)
- [ ] Email adresi (provider hesabı + Let's Encrypt notif)
- [ ] SSH client (Windows: PowerShell native; macOS/Linux: terminal)
- [ ] SSH key (`ssh-keygen -t ed25519`) — opsiyonel ama önerilir

### 1.3 Yerel hazırlıklar (deploy'dan önce yapılmalı)
- [ ] Repo GitHub'da (private veya public) — `git remote -v` ile teyit
- [ ] `next build` lokal'de temiz geçiyor (`npm run build`)
- [ ] Tüm migration'lar commit edildi (`prisma/migrations/`)
- [ ] `npm audit` kritik/yüksek sorun yok
- [ ] `.env` (geliştirme) commit'e GİTMEMİŞ (`.gitignore` doğrulandı)
- [ ] Lokal Docker build smoke test yapıldı (`docker build -t portfolio-test .`)

---

## 2. Mimari özet

```
┌──── Internet ────┐
│ 80, 443 (HTTPS) │
└──────────────────┘
         ↓
┌────────── VPS (Linux + Docker) ────────────────────────────────────┐
│                                                                     │
│  ┌─ /opt/infra/ ──────────────────────────────────────────────┐    │
│  │ Caddy reverse proxy (tek SSL daemon + tek 80/443 portu)    │    │
│  │ Caddyfile → import sites/*.caddyfile                        │    │
│  │ Volumes: caddy-data (SSL certs), caddy-config              │    │
│  └──────┬─────────────────────────────────────────────────────┘    │
│         │                                                           │
│         │ Docker network: web (external, paylaşılan)               │
│         │                                                           │
│   ┌─────┼──────────────────────────────────────┐                   │
│   │     │                                       │                   │
│   ↓     ↓                                       ↓                   │
│  /opt/portfolio/         /opt/<site2>/        /opt/<site3>/        │
│  ┌──────────────┐        ┌──────────────┐    ┌──────────────┐      │
│  │ app:3001     │        │ app:xxxx     │    │ app:xxxx     │      │
│  │ db (private) │        │ db (private) │    │ ...          │      │
│  │              │        │              │    │              │      │
│  │ network:     │        │ network:     │    │ network:     │      │
│  │  - internal  │        │  - internal  │    │  - internal  │      │
│  │  - web ←─────┼────────┼─ web ←───────┼────┼─ web         │      │
│  └──────────────┘        └──────────────┘    └──────────────┘      │
│                                                                     │
│  Cron: db-backup.sh (her site) → /opt/<site>/backups/              │
│   ↓ (rsync/rclone) → off-site backup host                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Önemli:**
- DB host'a expose edilmiyor (port forward yok). Yalnız iç network'ten erişilir
- Her site'ın DB'si ayrı container + ayrı volume → site'lar birbirinin DB'sine ulaşamaz
- Caddy `web` external network üzerinden tüm site'lara reverse proxy yapar
- Tek SSL daemon (Caddy) hepsini Let's Encrypt'ten otomatik yönetir

---

## 3. Karar matrisi

### 3.1 Hosting provider — agnostik karşılaştırma

Aşağıdaki tablo seçimde yardımcı olsun. Mevcut yapı **herhangi bir Linux VPS'te** çalışır.

| Provider | Plan | RAM/CPU | Disk | Aylık | Trafik | Not |
|---|---|---|---|---|---|---|
| **Contabo** | VPS S | 4 vCPU / 8 GB | 200 GB SSD | ~€5 | 32 TB | Ucuz, çok RAM/disk; support zayıf, ara sıra yavaşlık |
| Hetzner | CX22 | 2 vCPU / 4 GB | 40 GB SSD | ~€4.79 | 20 TB | AB içi, kart ile direkt hesap |
| Hetzner | CPX21 (AMD) | 3 vCPU / 4 GB | 80 GB SSD | ~€6.84 | 20 TB | Daha güçlü CPU |
| Hostinger | KVM 2 | 2 vCPU / 8 GB | 100 GB | ~$8-15 | 8 TB | TR ödeme rahat, çoğu zaman indirim |
| DigitalOcean | Basic | 1 vCPU / 2 GB | 50 GB | $12 | 2 TB | UI iyi, dökümantasyon mükemmel |
| Vultr | Regular | 1 vCPU / 2 GB | 55 GB | $12 | 2 TB | Frankfurt'tan TR ping iyi |
| Oracle Cloud (free tier) | Always Free Ampere | 4 vCPU ARM / 24 GB | 200 GB | **$0** | 10 TB | Sürekli ücretsiz; ARM (Docker image multi-arch lazım) |
| Kendi sunucu (home VPS) | — | Sınırsız | Sınırsız | $0 | ISP'ye bağlı | DDoS riski; Cloudflare Tunnel ile mitige |

**Birden fazla site planlıyorsan**: en az 4 GB RAM seç. Contabo VPS S (€5) veya Hetzner CX22 (€4.79) uygun.

**Tek site içinse**: 2 GB RAM yeterli. DigitalOcean / Vultr basic plan veya Hetzner CX22 4 GB.

**Maliyet vs konfor**:
- Min budget: Oracle Cloud Always Free (sıfır maliyet, ama ARM container build gerekir)
- Best value: Contabo VPS S (4 vCPU + 8 GB + 200 GB)
- En stable: Hetzner CX22 (AB, mature DC)

### 3.2 Domain

| Kaynak | Yaklaşık fiyat | Not |
|---|---|---|
| Cloudflare Registrar | $9-12/yıl (.com) | At-cost, en ucuz; ama Cloudflare hesabı şart |
| Porkbun | $9-11/yıl | Whois privacy free |
| Namecheap | $11-15/yıl | UI iyi |
| Türk ISP'leri (Atak Domain, NataHost vs.) | ₺200-500/yıl | Yerel ödeme; bazıları DNS panel zayıf |

**Önerim:** Cloudflare Registrar — domain + DNS + DDoS + CDN tek panelden.

### 3.3 DNS (Cloudflare opt-in)

| Mod | Avantaj | Dezavantaj |
|---|---|---|
| **Cloudflare proxy ON** ⭐ | DDoS koruması, edge cache, gizli origin IP, free SSL | Caddy SSL'i hala gerekli (origin-edge için) |
| Cloudflare DNS only | Basit, Caddy kontrolü | DDoS koruması yok, IP exposed |
| Provider DNS (Hetzner DNS Console vb.) | Cloudflare hesabı gerek değil | DDoS koruması yok |

**Önerim:** Cloudflare proxy ON. Caddy SSL'i hâlâ kullan (Cloudflare SSL/TLS mode: "Full (strict)").

### 3.4 Backup stratejisi

| Katman | Komut/Araç | Aciliyet |
|---|---|---|
| Lokal DB backup | `db-backup.sh` cron (her gece) | Hazır ✓ |
| Lokal uploads backup | `tar -czf uploads-$(date).tar.gz` ile docker volume | **Eklenmeli** |
| Off-site (kritik) | rsync to başka VPS / rclone to R2/S3/B2 | **Şart** |
| VPS provider snapshot | Provider'a göre (~€1/ay) | Opsiyonel ek katman |

**Önerim:** Provider snapshot (varsa) + rclone ile haftada bir Cloudflare R2'ye sync.

### 3.5 Monitoring (opsiyonel ama önerilir)

| Araç | Maliyet | Kapsam |
|---|---|---|
| Uptime Kuma (self-host, infra'ya ek olarak) | Free | Aynı VPS'te container, dış IP'den izleme önerilir |
| **UptimeRobot** ⭐ | Free (50 monitor, 5 dk interval) | Dış izleme, email alert |
| Better Stack | Free tier | Modern UI, log aggregation |
| Healthchecks.io | Free (20 check) | Cron-job için heartbeat |

**Önerim:** UptimeRobot (free tier) + Healthchecks.io (db-backup cron için heartbeat).

### 3.6 Subdomain stratejisi (multi-site için kritik)

| Strateji | Örnek | Avantaj | Dezavantaj |
|---|---|---|---|
| **Subdomain per site** ⭐ | `portfolio.x.com`, `vault.x.com` | Site'lar birbirinden tamamen ayrı; cache, cookie izolasyonu | Her site için DNS kaydı |
| Tek domain + path | `x.com/portfolio`, `x.com/vault` | Tek DNS, tek SSL | Path routing karmaşık; cookie scope sorunu |
| Ayrı domain'ler | `portfolio.com`, `vault.com` | Markaya özel | Her biri için ayrı domain ücreti |

**Önerim:** Subdomain per site (`portfolio.your-domain.com`). En az ücret + en az karmaşıklık.

---

## 4. Adım akışı (zaman tahminleri ile)

| # | Adım | Süre | Bağımlılık | Risk |
|---|---|---|---|---|
| 1 | Hesap aç (provider) + kimlik doğrula | 15-30 dk | Kredi kartı | Düşük |
| 2 | Domain al + DNS panel | 10 dk | — | Düşük |
| 3 | VPS oluştur (Ubuntu 24.04, SSH key) | 5 dk | Hesap | Düşük |
| 4 | DNS A kayıtları (subdomain'ler) | 5 dk + propagation | Domain hesabı | Düşük (5-30 dk propagation) |
| 5 | SSH bağlan + sistem update + firewall | 10 dk | VPS IP, SSH | Düşük |
| 6 | Docker install | 5 dk | sudo | Düşük |
| 7 | **Infra klasörünü VPS'e kopyala + Caddy kalk** | 10 dk | Docker | Düşük |
| 8 | Portfolio repo clone + .env hazırla | 15 dk | git, openssl rand | **Yüksek** (yanlış env = app açılmaz) |
| 9 | `./deploy.sh --bootstrap` | 5-10 dk | Yukarıdakiler | Orta |
| 10 | Cloudflare proxy aç | 5 dk | Domain Cloudflare'de | Düşük |
| 11 | Admin login + smoke test | 10 dk | Site açık | Düşük |
| 12 | Backup cron + healthcheck monitor | 10 dk | UptimeRobot hesabı | Düşük |
| 13 | Off-site backup ayarı (R2/B2 + rclone) | 30-60 dk | rclone config | Orta |

**Toplam:** **2-3 saat** (UptimeRobot ve off-site sonraya bırakılırsa 1.5 saat).

---

## 5. Infra + Portfolio deploy akışı detayı

### 5.1 İlk infra setup (Adım 7)
```
1. /opt/infra/ klasörü oluştur, infra-example/ içeriğini kopyala  (~2 dk)
2. .env oluştur (sadece ADMIN_EMAIL gerek)                          (~1 dk)
3. sites/portfolio.caddyfile'da domain'i değiştir                    (~1 dk)
4. docker compose up -d
   ├─ Caddy image pull (~30 sn ilk seferde)
   ├─ web network oluştur
   └─ Caddy başlar, sertifika BEKLEMEDE (henüz site yok)             (~5 sn)
```

### 5.2 Portfolio deploy (Adım 9: `./deploy.sh --bootstrap`)
```
1. git pull --ff-only                                                (~3 sn)
2. docker compose build app
   ├─ deps stage: npm ci                                             (~1-2 dk, ~150 MB indir)
   ├─ builder stage: prisma generate + npm run build                 (~1-2 dk)
   └─ runner stage: file copy + permissions                          (~10 sn)
3. docker compose up -d
   ├─ postgres container kalk + healthy bekle                        (~10 sn)
   └─ app container kalk
       ├─ npx prisma migrate deploy                                  (~3-5 sn — 4 migration)
       └─ node server.js (Next.js standalone)                        (~3-5 sn)
4. App container `web` network'üne bağlanır
5. Caddy reload otomatik — yeni container'ı tespit eder              (~2 sn)
6. Bootstrap seed çalışır
   ├─ AdminUser create                                               (~50 ms)
   ├─ AboutContent create                                            (~50 ms)
   ├─ WorkExperience x6 createMany                                   (~100 ms)
   ├─ Project x2 createMany                                          (~100 ms)
   └─ PageSeo x5 create                                              (~250 ms)
7. Caddy SSL alma (ilk istek gelince)                                (~10-30 sn — Let's Encrypt)
8. Health check loop (deploy.sh)                                     (~5-10 sn)
```

**İlk deploy'da tarayıcıda ilk istek yapıldığında SSL handshake biraz gecikebilir.**

---

## 6. Post-deploy doğrulama protokolü

### 6.1 Public erişim
- [ ] `curl -I https://portfolio.your-domain.com` → 200, `strict-transport-security` header'ı görünüyor
- [ ] `curl https://portfolio.your-domain.com/robots.txt` → doğru içerik
- [ ] `curl https://portfolio.your-domain.com/sitemap.xml` → 5 sayfa + project'ler
- [ ] Tarayıcıda site açılıyor, kilit simgesi yeşil
- [ ] DevTools > Network → HTTP/2 veya HTTP/3 kullanılıyor
- [ ] DevTools > Application > Cookies → `locale` ve `theme` cookie'leri çalışıyor
- [ ] `/about`, `/career`, `/projects`, `/contact` hepsi 200

### 6.2 Admin
- [ ] `https://portfolio.your-domain.com/admin/login` açılıyor
- [ ] `.env`'deki email/şifre ile giriş başarılı
- [ ] Dashboard'da stat kartları + aktif iş (varsa) görünüyor
- [ ] Bir test mesajı gönder (`/contact` formundan), admin'de listede gör

### 6.3 SEO
- [ ] [Google Search Console](https://search.google.com/search-console)'da property ekle (DNS doğrulama veya HTML upload)
- [ ] Sitemap submit: `https://portfolio.your-domain.com/sitemap.xml`
- [ ] [PageSpeed Insights](https://pagespeed.web.dev) > anasayfa > 90+ skoru görmeli
- [ ] [Schema.org validator](https://validator.schema.org) > Person + WebSite JSON-LD doğrulansın
- [ ] [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) → OG image görünüyor

### 6.4 Güvenlik
- [ ] `https://securityheaders.com/?q=portfolio.your-domain.com` → A veya A+ skoru
- [ ] `/admin/login` `<meta name="robots" content="noindex, nofollow">` (view source)
- [ ] DB host'a expose değil (`telnet your-vps-ip 5432` → bağlanmamalı)
- [ ] `https://portfolio.your-domain.com/.env` veya `/.git/config` → 404 (Caddy serve etmiyor)
- [ ] SSL test: [SSL Labs](https://www.ssllabs.com/ssltest/) → A skoru

### 6.5 Backup
- [ ] `./db-backup.sh` elle çalıştır, `backups/portfolio-*.sql.gz` üretildi
- [ ] Restore tatbikat: dump'ı `pg_restore` ile yeni bir test db'ye yükle
- [ ] Cron eklendi: `crontab -l` ile doğrula
- [ ] Bir gün sonra cron'un çalıştığını doğrula (`/var/log/portfolio-backup.log`)

### 6.6 Multi-site sağlık check
- [ ] `docker network inspect web` → portfolio-prod-app container'ı listede
- [ ] `cd /opt/infra && docker compose ps` → Caddy healthy
- [ ] Aynı VPS'te yeni site eklemek istesen, [MULTI-SITE.md](MULTI-SITE.md) "Yeni site eklemek" akışı net

---

## 7. Day-2 operations

### Günlük
- Hiçbir şey yok. Cron'lar çalışır.

### Haftalık
- `df -h` → disk kullanımı (50%'ye yaklaşırsa uploads/demos temizliği düşün)
- `docker system df` → image/volume kullanımı
- Backup log: `tail -30 /var/log/portfolio-backup.log`

### Aylık
- `docker system prune -a` (kullanılmayan eski image'ları sil — volume'lere dokunmaz)
- VPS provider fatura kontrolü
- Uptime istatistikleri (UptimeRobot dashboard)

### Update prosedürü (yerel'de değişiklik yaptıktan sonra)
```bash
# Yerel
git add . && git commit -m "..." && git push

# VPS
ssh user@vps
cd /opt/portfolio
./deploy.sh
```
Downtime: ~5-10 sn (Docker container recreate). **Diğer site'ları etkilemez** — her site bağımsız.

### Yeni site eklemek (15-30 dk)
[MULTI-SITE.md](MULTI-SITE.md) → "Yeni site eklemek" bölümüne bak.

---

## 8. Disaster recovery senaryoları

| Senaryo | Etki | Restore süresi | Önlem |
|---|---|---|---|
| VPS donanım arızası | TÜM site'lar down | 2-4 saat (yeni VPS + backup restore) | Off-site backup şart |
| Yanlışlıkla `docker compose down -v` (bir site) | O sitenin verisi silinir | 1 saat (son backup'tan restore) | DEPLOY.md uyarısını oku |
| Infra (Caddy) down | TÜM site'lara erişim kesilir (container'lar ayakta kalır) | 5 dk (Caddy restart) | Healthcheck monitor |
| Bir site memory leak | O site down, diğer site'ları yavaşlatabilir | 10 dk (site restart) | `docker stats` ile izle |
| Provider hesap askıya alma | TÜM site'lar down | Birkaç gün (provider çözene kadar veya migrate) | Fatura dikkat + yedek provider hesabı |
| DDoS saldırısı (Cloudflare olmadan) | TÜM site'lar down, bant gen. tükenir | Cloudflare aktif et | Proxy mode ON gerekli |
| Disk dolması | TÜM site'lar yavaşlar | 30 dk (cleanup) | Aylık `df -h` |
| Yanlış migration | İlgili site etkilenir, diğerleri etkilenmez | 1 saat (backup restore) | Migration prod'a deploy etmeden test |
| Caddy SSL renewal başarısızlığı | HTTPS kırılır (TÜM sites etkili) | 30 dk (Caddy logs + manual renew) | Let's Encrypt notif email kontrolü |
| `web` network silindi | Caddy'den site'lara erişim biter | 5 dk (infra restart) | Düşük olasılık |

---

## 9. Maliyet özeti (yıllık, tek site)

| Kalem | Maliyet | Not |
|---|---|---|
| Tipik VPS (Contabo VPS S) | ~€5/ay × 12 = **€60/yıl** | 4 vCPU + 8 GB + 200 GB |
| Alternatif: Hetzner CX22 | €4.79/ay × 12 = **€57.48/yıl** | 2 vCPU + 4 GB |
| Alternatif: Oracle Free | **€0** | Always Free Ampere ARM |
| Provider snapshot (opsiyonel) | ~€1/ay × 12 = **€12/yıl** | Ekstra koruma katmanı |
| Domain (.com via Cloudflare) | ~$10/yıl ≈ **€9/yıl** | İlk yıl bazen €1-2 promosyon |
| Cloudflare proxy + SSL | **€0** | Free tier yeterli |
| UptimeRobot | **€0** | Free 50 monitor |
| Cloudflare R2 off-site backup | **€0** | İlk 10 GB free; backup'lar küçük |
| **Toplam (Contabo)** | **~€70-80/yıl** | — |
| **Toplam (Oracle Free)** | **~€10-15/yıl** (sadece domain) | ARM build gerekir |

### Ek site başına ekstra maliyet
- **VPS**: 0 (aynı VPS'te host)
- **Domain**: 0 (subdomain ücretsiz)
- **SSL**: 0 (Caddy + Let's Encrypt)
- **Toplam ek**: **€0/yıl** per ek site

Yani aynı VPS'te 5 site host edersen toplam yıllık maliyet hâlâ ~€80. Multi-site'ın asıl ekonomik avantajı budur.

---

## 10. Risk register

| Risk | Olasılık | Etki | Mitigation |
|---|---|---|---|
| `.env` yanlış değer (typo) | Orta | Yüksek (app açılmaz) | `.env.production.example`'ı dikkatli kopyala; secrets `openssl rand` ile üret |
| DNS propagation gecikmesi | Yüksek | Düşük (sadece SSL bekler) | İlk deploy'u sabırlı yap, 30 dk bekle |
| Backup restore tatbikatı yapılmamış | Yüksek | Çok yüksek | Deploy sonrası mutlaka bir test restore yap |
| Off-site backup yok | Orta | Catastrophic | rclone + R2/B2 kurulumu deploy'la birlikte yap |
| Build'de OOM (2 GB RAM düşük) | Düşük | Build başarısız | 4 GB RAM seç; veya `--memory-swap` ekle |
| Disk dolması | Orta | Yüksek (tüm site'lar) | Uploads/demos cap koy, periyodik temizlik |
| Migration prod'da hata | Düşük | Çok yüksek (o site) | Migration'ları staging'de test et; backup hazır |
| Cloudflare proxy off, IP exposed | Düşük | Yüksek (DDoS) | İlk deploy'dan sonra proxy ON et |
| Container restart loop | Orta | O site down | `docker logs app` ile teşhis |
| `web` network silinmesi | Düşük | TÜM site'lar erişilemez | infra'yı `docker compose down -v` yapma |
| Bir site'ın kötü kodu RAM tüketir | Orta | Diğer site'ları etkiler | `docker stats` ile izle; memory limit koy |
| Aynı container_name çakışması | Düşük | Yeni site kalkmaz | Her site uniq container_name kullan |

---

## 11. Acil durum komutları (kopyala-yapıştır)

```bash
# === Genel ===
# Tüm container'lar durumu
docker ps -a

# Network'ler
docker network ls
docker network inspect web   # Caddy ile paylaşılan

# Disk + bellek
df -h
free -h
docker system df

# === Infra (Caddy) ===
cd /opt/infra

# Caddy log
docker compose logs -f caddy

# Caddyfile değişikliği reload (zero downtime)
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile

# Caddy config validation
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile

# === Portfolio (veya başka site) ===
cd /opt/portfolio

# Container durumu
docker compose -f docker-compose.production.yml ps

# Loglar
docker compose -f docker-compose.production.yml logs -f app
docker compose -f docker-compose.production.yml logs -f db

# Container'a gir (debug)
docker compose -f docker-compose.production.yml exec app sh
docker compose -f docker-compose.production.yml exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

# Tek servisi restart
docker compose -f docker-compose.production.yml restart app

# Sıfırdan rebuild
docker compose -f docker-compose.production.yml build --no-cache app
docker compose -f docker-compose.production.yml up -d

# Backup manuel
./db-backup.sh

# Restore (acil!)
gunzip -c backups/portfolio-LATEST.sql.gz | \
  docker compose -f docker-compose.production.yml exec -T db \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

---

## 12. Gelecek iyileştirmeler (deploy sonrası — acil değil)

| Öncelik | İş | Tahmini efor |
|---|---|---|
| Yüksek | Contact form notification (admin'e email gelsin yeni mesajda) | 1 saat (Resend/Postmark integration) |
| Orta | Off-site backup automation (rclone + R2 cron) | 30 dk |
| Orta | UptimeRobot + Healthchecks.io kurulumu | 15 dk |
| Orta | Memory limit per site (docker-compose'da `deploy.resources.limits`) | 10 dk |
| Düşük | Cloudflare R2'ya uploads taşıma (VPS yerine — multi-site için ölçeklenebilir) | 2-3 saat |
| Düşük | CDN cache (Cloudflare Page Rules — static asset 1 yıl cache) | 15 dk |
| Düşük | Log aggregation (Better Stack veya Grafana Loki) | 2 saat |
| Düşük | 2FA admin login (TOTP) | 2-3 saat |
| Düşük | i18n SEO için path-based locale | 4-6 saat |
| Düşük | caddy-docker-proxy (auto-discovery) | 1-2 saat |

---

## 13. Karar günü checklist

- [ ] Bu dökümanın §3'üne (karar matrisi) baktım ve seçimlerimi yaptım
- [ ] Hesaplar açık: VPS provider, domain registrar, (opsiyonel) Cloudflare, UptimeRobot
- [ ] Yerel'de `npm run build` temiz
- [ ] Yerel'de `docker build` temiz (smoke test daha önce yapıldı)
- [ ] Repo GitHub'da, deploy edebileceğim branch hazır
- [ ] `.env.production.example`'ı okudum, doldurmam gereken değerleri anladım
- [ ] `openssl rand -base64 48` (JWT) ve `openssl rand -base64 24` (DB pass) komutlarını biliyorum
- [ ] `infra-example/` klasörünün VPS'e nasıl kopyalanacağını biliyorum
- [ ] DEPLOY.md'yi ve MULTI-SITE.md'yi yan sekmede açtım
- [ ] Acil durum komutları (§11) bir yerde duruyor
- [ ] Backup tatbikatı için 30 dakika ayırdım

Hazırsan, [DEPLOY.md](DEPLOY.md) #1'den başla. Önce infra, sonra portfolio. 2-3 saat sonra portfolio yayında ve ek site eklemek için tüm altyapı hazır. 🚀
