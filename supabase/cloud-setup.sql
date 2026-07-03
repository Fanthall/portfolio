-- Portfolio cloud şema kurulumu — Supabase SQL Editor'a yapıştır + Run.
-- (3 migration birleşik: şema+RLS+grant + service_role + about CMS alanları)

-- ==== 20260703011009_init_schema.sql ====
-- Portfolio — full Supabase-native schema (Prisma emekliye ayrildi).
-- Naming: snake_case tablo/kolon (PostgREST/Supabase idiomatik). Domain katmani
-- (lib/data/*) bunlari camelCase TS tipine map eder.
-- Auth: admin_user tablosu YOK — Supabase Auth (auth.users) devralir; "admin"
-- = kimligi dogrulanmis tek kullanici (public signup kapali).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type demo_type as enum (
  'EXTERNAL_LINK', 'EMBEDDED_HTML', 'DOWNLOAD_ONLY', 'VIDEO_ONLY', 'GALLERY_ONLY'
);

create type page_key as enum (
  'HOME', 'ABOUT', 'CAREER', 'PROJECTS', 'CONTACT'
);

-- ---------------------------------------------------------------------------
-- updated_at otomatik dokunma
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- about_content (singleton, id=1)
-- ---------------------------------------------------------------------------
create table about_content (
  id               int primary key default 1,
  title_tr         text not null,
  title_en         text not null,
  bio_tr           text not null,
  bio_en           text not null,
  photo_url        text,
  social_links     jsonb not null default '{}'::jsonb,
  -- Beceri gruplari: [{ titleTr, titleEn, items: string[] }] — null ise koddaki default
  skills           jsonb,
  site_title       text,
  site_description text,
  updated_at       timestamptz not null default now(),
  constraint about_singleton check (id = 1)
);
create trigger about_content_updated before update on about_content
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- work_experience
-- ---------------------------------------------------------------------------
create table work_experience (
  id           uuid primary key default gen_random_uuid(),
  company_name text not null,
  role_tr      text not null,
  role_en      text not null,
  desc_tr      text not null,
  desc_en      text not null,
  start_date   date not null,
  end_date     date,                       -- null => aktif is
  "order"      int  not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger work_experience_updated before update on work_experience
  for each row execute function set_updated_at();
create index work_experience_order_idx on work_experience ("order");

-- ---------------------------------------------------------------------------
-- project
-- ---------------------------------------------------------------------------
create table project (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title_tr     text not null,
  title_en     text not null,
  summary_tr   text not null,
  summary_en   text not null,
  desc_tr      text not null,
  desc_en      text not null,
  cover_image  text,
  demo_type    demo_type not null default 'GALLERY_ONLY',
  demo_url     text,
  demo_folder  text,
  download_url text,
  video_url    text,
  repo_url     text,
  tags         text[] not null default '{}',
  is_featured  boolean not null default false,
  "order"      int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger project_updated before update on project
  for each row execute function set_updated_at();
create index project_featured_idx on project (is_featured, "order");

-- ---------------------------------------------------------------------------
-- project_image (cascade project ile)
-- ---------------------------------------------------------------------------
create table project_image (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references project(id) on delete cascade,
  url        text not null,
  alt_tr     text,
  alt_en     text,
  "order"    int not null default 0,
  created_at timestamptz not null default now()
);
create index project_image_project_idx on project_image (project_id, "order");

-- ---------------------------------------------------------------------------
-- contact_message (public insert, admin-only read)
-- ---------------------------------------------------------------------------
create table contact_message (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  body       text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index contact_message_created_idx on contact_message (created_at desc);

-- ---------------------------------------------------------------------------
-- page_seo (per-page override)
-- ---------------------------------------------------------------------------
create table page_seo (
  id             uuid primary key default gen_random_uuid(),
  page_key       page_key unique not null,
  title_tr       text,
  title_en       text,
  description_tr text,
  description_en text,
  og_image       text,
  no_index       boolean not null default false,
  updated_at     timestamptz not null default now()
);
create trigger page_seo_updated before update on page_seo
  for each row execute function set_updated_at();

-- ===========================================================================
-- Row Level Security
--   Public (anon) icin: yayindaki icerik SELECT; contact_message INSERT.
--   Admin yazma islemleri sunucu tarafinda SERVICE ROLE ile (RLS bypass).
-- ===========================================================================
alter table about_content   enable row level security;
alter table work_experience enable row level security;
alter table project         enable row level security;
alter table project_image   enable row level security;
alter table contact_message enable row level security;
alter table page_seo        enable row level security;

-- Public read (herkes)
create policy "public read about_content"   on about_content   for select using (true);
create policy "public read work_experience" on work_experience for select using (true);
create policy "public read project"         on project         for select using (true);
create policy "public read project_image"   on project_image   for select using (true);
create policy "public read page_seo"        on page_seo        for select using (true);

-- Public contact insert (iletisim formu) — okuma/silme YOK
create policy "public insert contact_message" on contact_message for insert with check (true);

-- ===========================================================================
-- Data API grants (yeni Supabase default: tablolar otomatik expose EDILMEZ)
-- ===========================================================================
grant select on about_content, work_experience, project, project_image, page_seo
  to anon, authenticated;
grant insert on contact_message to anon, authenticated;

-- authenticated tum icerigi yonetebilsin (admin panel ilerde istemci-taraf ihtiyaci)
grant select, insert, update, delete
  on about_content, work_experience, project, project_image, contact_message, page_seo
  to authenticated;

-- service_role (admin sunucu katmani, RLS bypass) tam yetki — yeni Supabase
-- default'unda otomatik degil, acikca verilmeli (yoksa admin CRUD permission denied).
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

-- ==== 20260703210948_grant_service_role.sql ====
-- service_role tablo yetkileri.
-- Yeni Supabase default'unda (auto_expose_new_tables kapalı) tablolar Data-API
-- rollerine otomatik GRANT edilmez. Admin katmanı service_role ile çalıştığından
-- (createSupabaseAdminClient, RLS bypass) tablo yetkileri açıkça verilmeli;
-- aksi halde admin CRUD "permission denied for table" alır.
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

-- Bundan sonra public şemada oluşturulacak tablolar için de otomatik olsun.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;

-- ==== 20260703213046_about_cms_fields.sql ====
-- about_content'e CMS alanlari (additive, veri kaybi yok):
--   role_tr/role_en       → anasayfa hero eyebrow (rol etiketi)
--   tagline_tr/tagline_en → anasayfa hero alt-metni
--   projects_worked       → "Calisilan proje" istatistigi (elle girilebilir)
-- Hepsi nullable → null iken kod/i18n fallback devreye girer.
alter table about_content
  add column if not exists role_tr        text,
  add column if not exists role_en        text,
  add column if not exists tagline_tr     text,
  add column if not exists tagline_en     text,
  add column if not exists projects_worked int;

