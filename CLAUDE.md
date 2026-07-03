# portfolio

Sezer Demir DEDEK'in kişisel portföy uygulaması — admin panelinden yönetilen, çift dilli (TR/EN), modern Next.js stack'i. Kök `../CLAUDE.md` workspace base dosyasıdır; bu dosya portfolio-spesifik bağlam verir.

## Geçmiş

Önceki sürüm CRA (Create React App) + react-router + statik JSON içerik + GitHub Pages deploy'undaydı. 2026-05-13'te bu klasör üstüne Next.js 15 stack'i ile yeniden inşa edildi. Eski deploy `gh-pages` branch'inde referans olarak kalır.

## Hedef

- **Public:** Hakkımda, Kariyer, Projeler, İletişim sayfaları — DB'den içerik çekerek render eden, server component temelli, çift dilli, SEO odaklı
- **Admin (`/admin/*`):** Tüm içeriği (Hakkımda, Kariyer, Projeler, Mesajlar, SEO) tarayıcıdan yönetme, dosya upload (resim, demo HTML zip, Electron installer)
- **Demo hosting:** Static HTML demo'ları zip olarak yüklenip iframe'lenir; Electron .exe/.dmg gibi installer'lar download linki olarak sunulur

## Stack

| Katman | Teknoloji | Notlar |
|---|---|---|
| Framework | Next.js 15 (App Router) | RSC default, server actions, dynamic API routes |
| Dil | TypeScript strict | `tsconfig.json:11` |
| UI primitives | **shadcn/ui** | Komponentler `components/ui/` altında — paket değil, repo'da editlenebilir |
| Stil | Tailwind CSS v3.4 | CSS variables (slate + violet teması), `app/globals.css` |
| Icon | lucide-react | Tüm ikonlar |
| i18n | next-intl v4 | **Path-based locale**: TR prefix'siz (`/about`), EN `/en/*`; `i18n/routing.ts` + middleware; `messages/{tr,en}.json` |
| DB | **Supabase** (Postgres) | Local: Supabase CLI (port **54341** API / **54342** DB). Prod: Supabase cloud. `supabase/migrations/` + `supabase/seed.sql` |
| Data erişimi | **@supabase/supabase-js + @supabase/ssr** | `lib/supabase/{server,admin,client,middleware}.ts` · domain katmanı `lib/data/` (snake_case→camelCase map). Prisma **emekli** (`lib/db.ts`, `prisma/` artık kullanılmıyor). RLS: public read, admin yazma **service role** ile |
| Auth | **Supabase Auth** (cookie oturumu, @supabase/ssr) | Tek admin, public signup kapalı; `lib/auth.ts getCurrentAdmin` = getUser. Bootstrap kullanıcısı `scripts/supabase-bootstrap.mjs` |
| Form | react-hook-form (kurulu, opsiyonel) + zod (server-side validation) | Çoğu form native useState pattern |
| File upload | **Supabase Storage** (public bucket) | `images` (resim), `demos` (zip extract), `downloads` (installer). `lib/supabase/storage.ts`; `next.config` remotePatterns Supabase host'una izin verir |
| Zip extract | unzipper | `next.config.mjs` `serverExternalPackages` ile bundle dışında |
| Animasyon | CSS keyframes (`animate-fade-in`) | framer-motion kurulu ama aktif kullanım yok |

## Klasör haritası

```
portfolio/
├── app/
│   ├── (public)/                     # Public route group, header+footer wrapper
│   │   ├── page.tsx                  # Anasayfa — hero + aktif iş chip + featured projects + JSON-LD (Person, WebSite)
│   │   ├── layout.tsx                # Header + Footer + tema cookie okuma
│   │   ├── loading.tsx               # Public skeleton
│   │   ├── about/page.tsx
│   │   ├── career/page.tsx           # Şirkete göre grouped timeline
│   │   ├── contact/page.tsx
│   │   ├── projects/page.tsx
│   │   └── projects/[slug]/page.tsx  # generateMetadata project bazlı
│   ├── admin/
│   │   ├── login/page.tsx            # Public login, root layout altında, noindex
│   │   └── (panel)/                  # Auth-protected admin alanı
│   │       ├── layout.tsx            # getCurrentAdmin guard + AdminSidebar
│   │       ├── loading.tsx
│   │       ├── page.tsx              # Dashboard (stat'lar, son mesajlar, hızlı işlemler, son projeler, aktif iş spotlight)
│   │       ├── about/                # Hakkımda edit (site meta + bio + photo + socials)
│   │       ├── career/               # Career CRUD
│   │       ├── projects/             # Projeler liste + new + [id] edit (form + galeri + asset uploader)
│   │       ├── messages/             # Mesaj inbox + okuma/silme
│   │       └── seo/                  # Per-page SEO override (noindex toggle dahil)
│   ├── api/
│   │   ├── auth/{login,logout}/
│   │   ├── contact/                  # Public POST (zod validation)
│   │   └── admin/                    # Hepsi getCurrentAdmin korumalı
│   │       ├── about/                # PUT
│   │       ├── career/{,[id]}/
│   │       ├── projects/{,[id]/{,images/{,[imageId]}}}
│   │       ├── messages/[id]/
│   │       ├── seo/                  # PUT (batch)
│   │       └── upload/
│   │           ├── image/            # Genel multipart image upload (auth)
│   │           ├── demo/[slug]/      # Zip extract → public/demos/[slug]/
│   │           └── download/[slug]/  # Installer upload → public/downloads/[slug]/
│   ├── actions/preferences.ts        # Server action: setTheme (cookie + revalidate); locale URL ile taşınır
│   ├── layout.tsx                    # Root: NextIntlClientProvider + Providers + dinamik metadata (siteTitle DB'den)
│   ├── error.tsx                     # Global error boundary
│   ├── not-found.tsx                 # Özel 404
│   ├── globals.css                   # Tailwind directives + CSS variables (slate+violet, light+dark)
│   ├── providers.tsx                 # Client wrapper (boş — shadcn'de provider ihtiyacı yok)
│   ├── robots.ts                     # Dinamik /robots.txt
│   └── sitemap.ts                    # Dinamik /sitemap.xml (DB'den project slug + noIndex filtre)
├── components/
│   ├── ui/                           # shadcn primitives (Button, Input, Card, Label, Textarea)
│   ├── admin/                        # AdminSidebar, LoginForm, LogoutButton, AdminAboutForm,
│   │                                 # AdminSeoForm, CareerManager, ProjectForm, ProjectGallery,
│   │                                 # ProjectAssets (demo+installer upload), MessagesList, DeleteProjectButton
│   ├── Header.tsx                    # Theme-aware logo + nav + LanguageToggle + ThemeToggle + MobileNav
│   ├── Footer.tsx                    # DB'den sosyal linkler
│   ├── MobileNav.tsx, LanguageToggle.tsx, ThemeToggle.tsx
│   ├── ProjectDemo.tsx               # Public proje detayda demoType'a göre render (iframe/download/video/gallery/link)
│   ├── ContactForm.tsx
│   └── StructuredData.tsx            # JSON-LD inject helper (escape uygulanmış)
├── lib/
│   ├── db.ts                         # Prisma singleton (HMR-safe)
│   ├── auth.ts                       # signSession, verifySession, getCurrentAdmin, setSessionCookie
│   ├── seo.ts                        # getPageMetadata (per-page meta + OG + Twitter + canonical + robots)
│   ├── site.ts                       # getSiteUrl, PAGE_PATHS sabit
│   └── utils.ts                      # cn() — shadcn klasik tailwind-merge helper
├── i18n/request.ts                   # next-intl cookie-based locale resolver
├── messages/{tr,en}.json             # i18n catalog
├── prisma/
│   ├── schema.prisma                 # 7 model: AdminUser, AboutContent, WorkExperience, Project, ProjectImage, ContactMessage, PageSeo
│   ├── migrations/                   # 4 migration (initial_setup, about_site_meta, add_page_seo, page_seo_noindex)
│   └── seed.ts                       # Bootstrap admin + about + career (CV'den) + sample projects
├── middleware.ts                     # /admin/* için cookie varlık kontrolü (asıl verify admin layout'ta)
├── public/
│   ├── assets/                       # sezer.png, lightLogo.png, darkLogo.png (Header'da theme-aware)
│   ├── logoDark/, logoLight/         # Favicon set'leri (prefers-color-scheme'ye göre)
│   ├── uploads/                      # Admin image upload (gitignored)
│   ├── demos/                        # Demo zip extract (gitignored)
│   └── downloads/                    # Installer yüklemeleri (gitignored)
├── docker-compose.yml                # Sadece Postgres servisi, port 5437
├── tailwind.config.js                # shadcn tema tokens + animate plugin
├── components.json                   # shadcn config
├── next.config.mjs                   # next-intl plugin + serverExternalPackages: ["unzipper"]
└── tsconfig.json                     # strict mode, paths: "@/*"
```

## Veri modeli özeti

| Model | Anahtar alanlar | Not |
|---|---|---|
| `AdminUser` | email (unique), passwordHash | Tek admin, bcryptjs 12-round |
| `AboutContent` | id=1 singleton, titleTr/En, bioTr/En, photoUrl, socialLinks (JSON), siteTitle, siteDescription | Site geneli + kişisel hero içeriği; siteTitle/Description SEO fallback |
| `WorkExperience` | companyName, roleTr/En, descTr/En, startDate, endDate, order | `endDate === null` ⇒ **aktif iş**; Career sayfası şirkete göre grupluyor |
| `Project` | slug (unique), titleTr/En, summary, desc, coverImage, demoType (enum), demoUrl/Folder/downloadUrl/videoUrl, repoUrl, isFeatured, order | `demoFolder` = `/demos/[slug]/index.html` (zip upload sonrası otomatik) |
| `ProjectImage` | projectId, url, altTr/En, order | Cascade delete project ile birlikte |
| `ContactMessage` | name, email, subject, body, isRead, createdAt | Contact formu inbox'ı |
| `PageSeo` | pageKey (enum HOME/ABOUT/CAREER/PROJECTS/CONTACT), titleTr/En, descriptionTr/En, ogImage, noIndex | Per-page override; sitemap'tan noIndex olanlar düşer |

### DemoType enum
- `EXTERNAL_LINK` → demoUrl kullanılır
- `EMBEDDED_HTML` → demoFolder iframe'lenir (sandbox: allow-scripts allow-same-origin)
- `DOWNLOAD_ONLY` → downloadUrl indirme butonu
- `VIDEO_ONLY` → videoUrl embed iframe
- `GALLERY_ONLY` → sadece ProjectImage galerisi

## Sözleşmeler

- **Aktif iş** = `WorkExperience.endDate === null`. Home hero'da yeşil chip, Career sayfasında "Aktif" rozet + emerald ring, Admin dashboard'da spotlight kartı.
- **Locale değişimi**: **path-based** (SEO için; 2026-06-10'da cookie'den geçildi). TR varsayılan ve prefix'siz, EN `/en/*`. `i18n/routing.ts` (defineRouting, as-needed) + `i18n/navigation.ts` (locale-aware Link/usePathname/useRouter — public iç linkler BUNU kullanır, dış linkler next/link). LanguageToggle `router.replace(pathname, {locale}) + router.refresh()`. hreflang: `lib/site.ts buildLanguageAlternates` (tr/en/x-default, sitemap + metadata).
- **Theme değişimi**: `setTheme` server action → `theme` cookie. `<html class="dark">` server-side render edilir.
- **Admin auth**: 2 katman — middleware (`/admin/*` cookie var mı?) + admin layout (`getCurrentAdmin()` DB verify). API'ler ek olarak `getCurrentAdmin` check ediyor.
- **File upload security**: image (MIME whitelist + 5 MB), demo zip (extension whitelist + path traversal koruması + 20 MB total + 5 MB per file + `index.html` zorunlu), installer (extension whitelist + 150 MB).
- **Iframe sandbox**: yüklenen demo HTML'leri `sandbox="allow-scripts allow-same-origin"` ile izole; parent origin'i okuyamaz.
- **SEO fallback chain**: `pageSeo[locale]` → `PAGE_DEFAULTS[locale]` (`lib/seo.ts`) → `about.siteDescription`. OG image: `pageSeo.ogImage` → `about.photoUrl`.
- **JSON-LD**: Anasayfada Person (alumniOf, knowsAbout, sameAs sosyal linkler) + WebSite. `components/StructuredData.tsx` ile escape edilerek inject.
- **Slug regex**: `^[a-z0-9]+(?:-[a-z0-9]+)*$` (Project ve upload route'ları).
- **Revalidation**: tüm admin mutation'ları `revalidatePath("/", "layout")` çağırıyor — public cache anında güncellenir.

## Skill envanteri (CV'den, About sayfasında gösterilen)

- **Front-End:** React.js, React Native, TypeScript, Next.js, Tailwind CSS
- **AI & Agent Development:** Claude Code, Claude Agent SDK, MCP, LLM Integration, Prompt Engineering
- **Back-End:** Node.js, Java · Spring Boot, REST API, PostgreSQL, Supabase
- **Araçlar & Pratikler:** Git, OOP, Docker, Linux

> **Artık DB-driven + admin'den düzenlenebilir** (`/admin/about`): `about_content` tablosunda `skills` (jsonb, grup editörü), `role_tr/en` (hero eyebrow), `tagline_tr/en` (hero alt-metin), `projects_worked` (stat). Null iken kod/i18n fallback (`lib/skills.ts` DEFAULT_SKILLS · `messages home.eyebrow/subtitle`). Home stat'ları: yıl deneyim + şirket = kariyerden otomatik; çalışılan proje = `about.projectsWorked ?? max(dbProje,7)`.

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run supabase:start` | Yerel Supabase stack'i (Docker) kaldır (API 54341) |
| `npm run supabase:stop` | Supabase stack'i durdur |
| `npm run supabase:reset` | Migration + `seed.sql` yeniden uygula (local DB sıfırlanır) |
| `npm run supabase:types` | `lib/supabase/database.types.ts` yeniden üret |
| `npm run supabase:bootstrap` | Admin Auth kullanıcısı + Storage bucket'ları (idempotent) |
| `npm run bootstrap` | `supabase:start && supabase:reset && supabase:bootstrap` zinciri |
| `npm run dev` | Next.js dev server (port **3001**) |
| `npm run build` | Production build |
| `npm run start` | Production server (port 3001) |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |

## Portlar

- Supabase (local CLI): API **54341** · DB **54342** · Studio **54343** · Mailpit **54344** (bucket-list'in 5433x'inden ayrı, çakışmasız)
- Next.js: **3001** (PasswordManagement 3200, chat-view 1212'den ayrı)

## Env

| Değişken | Amaç |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL (dev: http://127.0.0.1:54341) — client'a gömülür |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon (public) key — RLS'e tabi, client'a gömülür |
| `SUPABASE_SERVICE_ROLE_KEY` | **GİZLİ** service role (RLS bypass) — sadece sunucu; repoya/commit'e girmez |
| `SUPABASE_BUCKET_IMAGES/_DEMOS/_DOWNLOADS` | Storage bucket adları (default images/demos/downloads) |
| `ADMIN_BOOTSTRAP_EMAIL` / `_PASSWORD` | `supabase:bootstrap` ile admin Auth kullanıcısı (dev: admin@portfolio.local) |
| `NEXT_PUBLIC_SITE_URL` | Canonical / OG / sitemap için absolute URL (dev: http://localhost:3001) |

## Geliştirme prensipleri

- **Server-first**: Server component default. Client component sadece interaktivite (form, toggle, drawer) için. Veri çekme `prisma` ile RSC içinde.
- **shadcn editable**: `components/ui/*` paket değil — gerektiğinde inline değiştirilir; düzenleyince geri yüklenme riski yok.
- **TR/EN deseni**: her metin alanı `xxxTr` / `xxxEn` çiftli; runtime'da `locale === "tr" ? trField : enField`. UI metni `messages/{tr,en}.json` catalog'da.
- **Tarih biçimleme**: `Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", ...)`.
- **Mutation pattern**: client fetch → API route → Prisma → `revalidatePath("/", "layout")` → `router.refresh()`.
- **Mevcut Postgres'e dokunma**: DB ile yapılan değişiklikler **admin panelden** yapılır. Seed dosyası sadece bootstrap için; production'da çalıştırılmaz (idempotent yine de).
- **File upload yolları**: dev'de `public/uploads|demos|downloads/` — bunlar `.gitignore`'da; production'da persistent disk (Docker volume veya S3 migration gerekir).

## Bilinen aksiyon noktaları

- **Deploy paketi**: Dockerfile + production docker-compose + Caddyfile henüz yok; sunucu alındığında hazırlanacak (Hetzner CX22 öneri).
- **File upload prod**: Vercel'de ephemeral; kendi VPS + Docker volume veya S3-uyumlu storage (Cloudflare R2) gerekir.
- **Admin mobile**: Sidebar artık drawer ile responsive; daha derinlemesine touch optimization (drag-to-close) atlandı, low priority.
- **next-intl deprecation**: v3 stable; v4 release olunca migration gözden geçirilmeli.
- **Image optimization**: `next/image` `remotePatterns` `*` set — production'da sıkılaştırılmalı (yalnız izin verilen CDN'ler).

## İlgili kayıtlar

- Workspace devlog: `workspace/devlog/portfolio.md`
- Plan dosyası: `~/.claude/plans/curried-shimmying-cocoa.md`
- Eski versiyon: `gh-pages` branch (`https://fanthall.github.io/portfolio/`)
