# Portfolio — Sezer Demir DEDEK

Next.js 15 + PostgreSQL + Prisma + shadcn/ui üzerine kurulu, admin panelinden tam yönetilebilen, iki dilli (TR/EN) kişisel portföy uygulaması.

> **English Summary** — A bilingual (TR/EN) personal portfolio built on Next.js 15 (App Router), PostgreSQL + Prisma, and shadcn/ui. Every piece of content — about, career timeline, projects, social links, contact-form inbox, per-page SEO — is editable from a built-in admin panel at `/admin`. Supports image uploads, embedded HTML demos (zip upload → iframe), and installer downloads (Electron `.exe`/`.dmg`). Server-component-first rendering, JWT-in-HTTPOnly-cookie auth, cookie-based locale + theme switching, dynamic `robots.txt` and `sitemap.xml`, OG/Twitter cards, and JSON-LD structured data.

## Özellikler

- **Public site**: Hakkımda, Kariyer (şirkete göre gruplanmış timeline + aktif iş vurgusu), Projeler (her biri kendi detay sayfasında), İletişim (form → admin inbox)
- **Admin paneli** (`/admin`): tüm içerik DB üzerinden tarayıcıdan yönetilir — site meta, biyografi, kariyer, projeler, sosyal linkler, mesajlar, per-page SEO
- **Dosya upload**: profil fotoğrafı + proje kapak/galeri görselleri + HTML demo (zip, iframe ile yayınlanır) + Electron installer (.exe/.dmg vs.)
- **i18n**: cookie-tabanlı TR/EN switch
- **SEO**: dinamik `robots.txt` + `sitemap.xml`, per-page meta override, OG/Twitter cards, JSON-LD (Person + WebSite), canonical URL'ler
- **Auth**: JWT in HTTPOnly cookie (bcryptjs), `/admin/*` middleware koruması
- **Tema**: cookie-tabanlı dark/light, modern slate + violet paleti

## Hızlı başlangıç (yerel geliştirme)

```bash
# 0. Bağımlılıkları kur
npm install

# 1. Postgres'i Docker'da kaldır (port 5437)
npm run db:up

# 2. Env dosyasını oluştur
cp .env.example .env
# (varsayılan değerler local için yeterli)

# 3. Schema'yı uygula + bootstrap içerik
npm run prisma:migrate
npm run prisma:seed

# 4. Dev server (port 3001)
npm run dev
```

Açılınca:
- Public: http://localhost:3001
- Admin login: http://localhost:3001/admin/login
  - Default: `admin@portfolio.local` / `admin-local-dev` (`.env`'den)

## Stack

| Katman | Teknoloji |
|---|---|
| Framework | Next.js 15 (App Router) |
| Dil | TypeScript strict |
| UI | shadcn/ui (komponentler `components/ui/`) + Tailwind |
| i18n | next-intl |
| DB | PostgreSQL 16 (Docker) |
| ORM | Prisma 6 |
| Auth | JWT HTTPOnly cookie + bcryptjs |
| Validation | zod |
| Form | react-hook-form |
| Icon | lucide-react |
| Zip | unzipper (demo upload) |

## Klasör yapısı

Detaylı klasör haritası ve sözleşmeler için **[CLAUDE.md](CLAUDE.md)**'ye bak.

## Production deploy

VPS'inde production yayına almak için (aynı VPS'te birden fazla site host edilebilen **multi-site topology** kullanılır — merkezi Caddy reverse proxy + per-site Docker stack):

1. **[prod-deploy-steps.md](prod-deploy-steps.md)** — Analiz, kararlar, provider karşılaştırma (Contabo/Hetzner/Oracle/...), maliyet, risk register, day-2 operations
2. **[DEPLOY.md](DEPLOY.md)** — Komut komut adım adım uygulama rehberi (önce infra, sonra portfolio)
3. **[MULTI-SITE.md](MULTI-SITE.md)** — Topology + aynı VPS'e yeni site ekleme prosedürü
4. **[infra-example/](infra-example/)** — Merkezi Caddy reverse proxy template (VPS'te `/opt/infra/` olarak kopyalanır)

Özet: Provider seçimi sende (Contabo VPS S ~€5, Hetzner CX22 ~€5, Oracle Free $0 ARM); Docker + merkezi Caddy + auto SSL. Toplam ilk yıl tipik €70-80 (tek site). Aynı VPS'e ek site eklemek $0/yıl ekstra.

### Başka bir AI ajanına devretmek istersen
**[AI-DEPLOY-PROMPT.md](AI-DEPLOY-PROMPT.md)** — Claude/Codex/Gemini gibi başka bir AI'a kopyala-yapıştır verebileceğin handoff talimatı.

## Dokümantasyon haritası

| Dosya / klasör | Amaç |
|---|---|
| `README.md` | Bu dosya — proje özeti + hızlı başlangıç |
| `CLAUDE.md` | Geliştirme için kapsamlı bağlam (klasör haritası, veri modeli, sözleşmeler, prensipler) |
| `DEPLOY.md` | Production deploy operasyonel rehber (komut bloklarıyla) |
| `prod-deploy-steps.md` | Deploy analitik kılavuz (kararlar, maliyet, risk, checklist) |
| `MULTI-SITE.md` | Aynı VPS'te birden fazla site host etme topology'si + ek site ekleme |
| `OPERATIONS.md` | Çalışan sistemi izleme: state dosyaları, komut → state etkisi, müdahale öncesi okuma kuralı |
| `infra-example/` | Merkezi Caddy reverse proxy template + per-site config örnekleri |
| `AI-DEPLOY-PROMPT.md` | Başka bir AI ajanına deploy işini devretmek için hazır prompt'lar |
| `scripts/generate-state.sh` | VPS'te sistem durumu özetleyen state dosyası üretici (deploy/backup sonrası otomatik çalışır) |
| `Dockerfile`, `docker-compose.production.yml` | Portfolio production deploy artifacts |
| `deploy.sh`, `db-backup.sh` | Deploy ve backup scriptleri |
| `.env.example` | Geliştirme için env şablonu |
| `.env.production.example` | Production için env şablonu |

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Dev server (port 3001) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript validation |
| `npm run db:up` / `db:down` | Local Postgres Docker |
| `npm run prisma:migrate` | Yeni migration üret + uygula |
| `npm run prisma:seed` | Idempotent bootstrap seed |
| `npm run bootstrap` | `db:up + migrate + seed` zinciri |

## Lisans

MIT (kişisel proje)
