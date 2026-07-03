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
