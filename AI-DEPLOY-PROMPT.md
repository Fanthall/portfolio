# AI ajanına deploy işini devretme kılavuzu

Bu dosya, başka bir AI ajanına (Claude, Codex, Gemini, ChatGPT, vb.) bu projeyi production'a deploy etme görevini devretmek için tasarlandı. Aşağıdaki prompt'u kopyala-yapıştır, AI ajanı senin için adım adım deploy'u yönetir.

---

## Nasıl kullanılır

1. Yeni bir AI ajan oturumu aç (CLI tabanlı: Claude Code, Codex CLI, Cursor, Aider; veya web tabanlı: Claude.ai, ChatGPT, Gemini)
2. AI ajanına projenin dosya erişimini ver (CLI'lar için: `cd portfolio/` içinde başlat; web'de: ilgili dosyaları paylaş)
3. Aşağıdaki **Prompt 1**'i (veya senaryona uygun olanı) kopyala-yapıştır
4. AI sana sıralı sorular soracak (VPS IP, domain, vs.)
5. Sorulara cevap ver, AI komutları çalıştırsın

---

## Prompt 1 — Sıfırdan VPS'e deploy

```
Bu portfolio projesini production'a deploy etmeni istiyorum.

NOT: Multi-site topology kullanıyoruz — merkezi Caddy reverse proxy (ayrı
stack) + portfolio (app+db, kendi stack'i). Önce infra (Caddy), sonra
portfolio kurulumu sırasıyla yapılır.

ÖNCE OKUMAN GEREKEN DOSYALAR (sırayla):
1. README.md  (proje genel özeti + doküman haritası)
2. DEPLOY.md  (operasyonel adımlar — bu kılavuzu birebir takip et)
3. MULTI-SITE.md  (topology + site izolasyonu mantığı)
4. OPERATIONS.md  (state dosyaları + müdahale öncesi okuma kuralı)
5. prod-deploy-steps.md  (kararlar, risk register, doğrulama checklist)
6. CLAUDE.md  (proje yapısı, klasör haritası, sözleşmeler)
7. infra-example/  klasörünün tamamı (Caddy compose + Caddyfile + sites/ + scripts/)
8. docker-compose.production.yml + Dockerfile + .env.production.example
9. deploy.sh + db-backup.sh + scripts/generate-state.sh

VPS'TE MEVCUT SİSTEME MÜDAHALE EDİYORSAN (yeni deploy değilse):
- ÖNCE /opt/portfolio/DEPLOY-STATE.md VE /opt/infra/INFRA-STATE.md OKU
- Bunlar otomatik üretilir; sistemin son fotoğrafını verir
- Onları okumadan hiçbir destructive komut çalıştırma
- Değişiklik yaptıktan sonra (Docker'a elle müdahaleyse) `./scripts/generate-state.sh`
  ile state'i yenile

İŞ TANIMI:
DEPLOY.md'nin 1-7. adımlarını birebir takip ederek bu projeyi benim VPS'ime
yayına al. ÖNCE merkezi infra (Caddy) kurulumu, SONRA portfolio deploy.

BENİM SAĞLAYACAĞIM BİLGİLER (her birini sıra ile bana sor):
1. VPS bağlantı bilgileri (IP + SSH kullanıcı + key/şifre)
2. VPS provider (Contabo/Hetzner/Oracle/başka) — bilgi amaçlı
3. Portfolio domain (örn. portfolio.example.com — A kaydı VPS IP'sine
   yönlendirilmiş olmalı; `dig portfolio.example.com +short` ile doğrula)
4. Admin email + güçlü şifre (admin panel giriş bilgilerim)
5. Cloudflare proxy kullanılacak mı (evet/hayır)
6. Off-site backup hedefi (Cloudflare R2 / S3 / başka — opsiyonel)
7. Aynı VPS'te ileride başka site eklenecek mi (varsa not düş)

SENİN YAPACAKLARIN (sıra önemli):
ADIM A — VPS bootstrap (DEPLOY.md §1):
  - SSH bağlan, apt update, ufw firewall
  - Docker install

ADIM B — Infra (merkezi Caddy, DEPLOY.md §2):
  - infra-example/ klasörünü /opt/infra/'ya kopyala
  - /opt/infra/.env oluştur (ADMIN_EMAIL)
  - /opt/infra/sites/portfolio.caddyfile'da `your-domain.com`'u gerçek
    domain ile değiştir
  - `cd /opt/infra && docker compose up -d`
  - Doğrula: `docker network ls | grep web` → web network görünmeli

ADIM C — Portfolio deploy (DEPLOY.md §3):
  - `git clone <repo> /opt/portfolio`
  - `.env` oluştur (.env.production.example'i kopyala):
    * JWT_SECRET = `openssl rand -base64 48`
    * POSTGRES_PASSWORD = `openssl rand -base64 24`
    * NEXT_PUBLIC_SITE_URL = `https://portfolio.<gerçek-domain>`
    * Bu değerleri bana göster (kayıt etmek için)
  - `chmod +x deploy.sh db-backup.sh && ./deploy.sh --bootstrap`

ADIM D — Doğrulama (prod-deploy-steps.md §6):
  - Public erişim, admin, SEO, güvenlik, backup checkbox'larını sırayla
    doğrula, sonuçları bana raporla

ADIM E — Backup + monitoring:
  - `crontab -e` ile db-backup.sh ekle (her gece 03:00)
  - Elle bir kez çalıştır, dosya üretildiğini doğrula

SON — bana özet ver:
  - Deployed URL
  - Admin login bilgileri
  - Backup konumu + cron schedule
  - "Yeni site eklemek için MULTI-SITE.md'ye bak" hatırlatması

ÖNEMLİ KISITLAR:
- `docker compose down -v` ASLA kullanma (volume siler → TÜM data kaybı)
- Infra stack'ini `down -v` yapma (web network silinir, SSL cert kaybolur)
- `prisma migrate dev` production'da ASLA çalıştırma — sadece `migrate deploy`
- `--seed` flag artık `--bootstrap` olarak değişti (eski flag reddedilir)
- Mevcut DB verisi varsa (admin'in girdiği içerik) ASLA üzerine yazma —
  seed script zaten idempotent ama dikkatli ol
- Container_name'lerin VPS'te uniq olduğundan emin ol
- Destructive ve risk içeren komutlardan önce mutlaka bana onay sor

Hadi başlayalım — önce hangi bilgiye ihtiyacın var?
```

---

## Prompt 2 — Mevcut deploy'a güncelleme push'u

Site zaten yayında; yerel değişiklikleri prod'a göndermek istiyorsan:

```
Portfolio projesinde yerel'de değişiklik yaptım, production'a deploy
etmeni istiyorum.

ADIMLAR:
1. Önce yerel'de değişiklikleri commit + push yap (eğer push'lanmamışsa)
2. Yerel'de `npm run build` ile prod build temiz mi doğrula
3. Eğer Prisma schema değiştiyse:
   a. Yerel'de `npx prisma migrate dev --name <açıklayıcı-ad>` çalıştır
   b. Yeni migration dosyasını commit et
4. SSH ile VPS'e bağlan (bilgiler: [bana sor])
5. `cd /opt/portfolio` (veya kurulu yolu)
6. `./deploy.sh` çalıştır (NOT: --bootstrap KULLANMA, mevcut data var)
7. Health check çıktısını bana raporla
8. Tarayıcıdan smoke test yap (siteyi aç, admin'e gir, basit bir CRUD dene)
9. Hata varsa `docker compose logs app | tail -50` ile bana göster

ÖNEMLİ:
- Downtime ~5-10 sn olmalı
- Volume'ler dokunulmaz, veri kaybı yok
- Migration applied edilmezse app start olmaz — log'a bak

Başlayabilir misin?
```

---

## Prompt 3 — Backup restore (acil durum)

Veri kaybı/bozulması yaşandı, en son backup'tan geri yüklemek istiyorsan:

```
Production portfolio'da veri kaybı yaşadım. En son backup'tan restore
etmeni istiyorum.

DURUM:
- VPS bağlantı: [bana sor]
- Sorun: [veri kaybının ne olduğunu sana söyleyeceğim]

ADIMLAR (DEPLOY.md §8 "Backup'tan restore" bölümüne göre):
1. SSH ile bağlan
2. `cd /opt/portfolio/backups` → en son `.sql.gz` dosyasını bul (ls -lt)
3. Restore ETMEDEN ÖNCE mevcut DB'yi snapshot al (güvenlik):
   ./db-backup.sh
4. Containerları durdur (sadece app, db'ye dokunma):
   docker compose -f docker-compose.production.yml stop app
5. DB'yi temizle ve yeniden hazırla — bu kısımdan ÖNCE bana onay sor
6. Restore komutunu çalıştır:
   gunzip -c <backup-dosyasi>.sql.gz | docker compose -f docker-compose.production.yml exec -T db psql -U $POSTGRES_USER -d $POSTGRES_DB
7. App container'ı tekrar başlat:
   docker compose -f docker-compose.production.yml start app
8. Health check + smoke test
9. Bana sonucu raporla

ÖNEMLİ: 5. adımda mutlaka durakla, bana onay sor. Restore destructive!
```

---

## Prompt 4 — Provider veya domain değişikliği (migration)

Mevcut yayından başka bir VPS'e veya domain'e taşımak istiyorsan:

```
Portfolio'u şu anki konumdan yeni bir konuma taşımak istiyorum.

MEVCUT (kaynak):
- VPS: [eski IP], SSH erişimi: [bilgiler]
- Domain: [eski domain]

HEDEF:
- VPS: [yeni IP], SSH: [yeni bilgiler]
- Domain: [yeni domain veya aynı]

ADIMLAR:
1. KAYNAK VPS'te:
   a. SSH ile bağlan
   b. ./db-backup.sh çalıştır → backups/ klasöründen en son .sql.gz'i al
   c. uploads + demos + downloads volume'lerini arşivle:
      docker run --rm -v portfolio_portfolio-uploads:/data -v $(pwd):/backup alpine tar -czf /backup/uploads.tar.gz -C /data .
      (demos ve downloads için aynısı)
   d. .env dosyasını güvenli yere kopyala (yeni VPS'te kullanılacak)
2. HEDEF VPS'te:
   a. DEPLOY.md §1-3'ü uygula (Docker, repo, .env)
   b. Domain için DNS'i yeni IP'ye yönlendir, propagation bekle
   c. ./deploy.sh çalıştır (bootstrap YAPMA)
   d. App durdur (db ayakta kalsın):
      docker compose -f docker-compose.production.yml stop app
   e. DB restore:
      gunzip -c <kaynaktan-aldığın>.sql.gz | docker compose ... exec -T db psql ...
   f. Volume restore:
      docker run --rm -v portfolio_portfolio-uploads:/data -v $(pwd):/backup alpine tar -xzf /backup/uploads.tar.gz -C /data
      (demos ve downloads için aynısı)
   g. App container'ı başlat
   h. Smoke test (her sayfayı açıp doğrula)
3. Eski VPS'i durdur (silmeden önce 1-2 hafta paralel tut):
   docker compose ... stop

Her ana adımda bana onay sor. Veri kaybı olmaması kritik.
```

---

## Eğer external AI yardım edemiyorsa: minimal manuel komut listesi

Hiçbir AI yok, sadece DEPLOY.md ve elin var:

```bash
# 1. VPS'te (tek seferlik)
ssh root@<VPS_IP>
curl -fsSL https://get.docker.com | sh
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable

# 2. Repo + env
git clone <REPO_URL> /opt/portfolio
cd /opt/portfolio
cp .env.production.example .env
# .env'yi düzenle: openssl rand -base64 48 (JWT), -base64 24 (POSTGRES_PASSWORD)
# Caddyfile'da your-domain.com'u değiştir
chmod 600 .env

# 3. İlk deploy
chmod +x deploy.sh db-backup.sh
./deploy.sh --bootstrap

# 4. Cron backup
echo "0 3 * * * /opt/portfolio/db-backup.sh >> /var/log/portfolio-backup.log 2>&1" | crontab -

# 5. Test
curl -I https://your-domain.com
# Browser: https://your-domain.com → admin login: .env'deki bootstrap credentials
```

---

## AI ajanı için context paketi (alternatif handoff yöntemi)

Eğer AI'a tek bir mesajda her şeyi vermek istiyorsan:

> **System prompt template:**
>
> "Sen bir DevOps mühendisisin. Aşağıdaki Next.js + PostgreSQL + Docker projesini bir Linux VPS'e production deploy edeceksin. Proje kökünde DEPLOY.md, prod-deploy-steps.md, CLAUDE.md, AI-DEPLOY-PROMPT.md ve hazır Docker config'leri var. AI-DEPLOY-PROMPT.md'deki 'Prompt 1'i takip et. Her destructive komut öncesi kullanıcıya onay sor."

---

## Hangi AI'lar bu işi yapabilir?

| AI | Uygunluk | Not |
|---|---|---|
| **Claude Code / Codex CLI / Aider** | ⭐⭐⭐⭐⭐ | Lokal dosya + SSH bash erişimi, ideal |
| **Cursor / Windsurf agent mode** | ⭐⭐⭐⭐ | IDE entegrasyonu, dosya editi + terminal |
| **Claude.ai** (web, Projects ile) | ⭐⭐⭐ | Dosya upload edebilirsin; SSH için sen komutları çalıştırırsın |
| **ChatGPT** (web) | ⭐⭐⭐ | Aynı — SSH için sen kopyalayıp çalıştırırsın |
| **Gemini** (web) | ⭐⭐⭐ | Aynı |

CLI tabanlı agent (Claude Code, Codex) varsa **tek mesajda** her şeyi halleder. Web AI'ları ile her komutu sen elle SSH'a yapıştırmak zorundasın ama yine de adımları AI yönlendirir.

---

## Son söz

Bu projedeki tüm dokümanlar (DEPLOY.md + prod-deploy-steps.md + CLAUDE.md) AI ajanlarının okuyup mantığı anlayacak şekilde yazıldı. Yukarıdaki prompt'ları kopyala-yapıştır kullan, AI sana sıralı sorular sorarak deploy'u yönetir. Senin tek katkın: bilgileri sağlamak ve onay/red vermek.
