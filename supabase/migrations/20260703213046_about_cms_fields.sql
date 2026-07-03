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
