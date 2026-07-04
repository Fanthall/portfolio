-- Portfolio icerik seed'i — `supabase db reset` sirasinda calisir.
-- Admin kullanicisi burada DEGIL (Supabase Auth) → scripts/seed-admin.mjs.
-- Idempotent: on conflict do nothing / singleton guard.

-- ---------------------------------------------------------------------------
-- about_content (singleton)
-- ---------------------------------------------------------------------------
insert into about_content (
  id, site_title, site_description, title_tr, title_en, bio_tr, bio_en,
  photo_url, social_links,
  role_tr, role_en, tagline_tr, tagline_en, projects_worked, skills
) values (
  1,
  'Sezer Demir DEDEK',
  'Front-End focused software engineer — portfolio',
  'Ben Sezer Demir DEDEK',
  'I''m Sezer Demir DEDEK',
  $bio_tr$Bilgisayar Mühendisliği mezunu, front-end odaklı bir yazılım mühendisiyim. Pamukkale Üniversitesi'nde Bilgisayar Programcılığı ön lisansımı okul birinciliği ile tamamladıktan sonra Eskişehir Osmangazi Üniversitesi Bilgisayar Mühendisliği bölümünden mezun oldum.

Kariyerime AVKAR Yazılım'da stajyer olarak başladım; yarı zamanlı ve sonrasında Junior Software Engineer rollerinde sağlık ve eğitim sektörü için React.js, React Native ve Java/Spring Boot ile uçtan uca projeler geliştirdim. Devamında Boxbilet'te Software Engineer olarak konser ve etkinlik biletleme ekosisteminde CMS ve yönetim arayüzleri kurdum, Paribu Biletleme'de Web App Engineer olarak etkinlik biletleme platformunun yönetim panelini hayata geçirdim.

Temiz mimari, TypeScript ile tip güvenli kod ve kullanıcı odaklı arayüzler üzerine çalışmayı seviyorum. Son dönemde ise yalnızca arayüzle sınırlı kalmayıp Claude Code ve Claude Agent SDK ile yapay zeka destekli araçlar ve otonom ajanlar geliştiriyorum. Boş zamanlarımda puzzle çözüyor, hikayeli oyunlar oynuyor ve film/dizi izliyorum.$bio_tr$,
  $bio_en$I am a Computer Engineering graduate and a front-end focused software engineer. I completed my associate degree in Computer Programming at Pamukkale University as the valedictorian, then earned my Bachelor's in Computer Engineering at Eskişehir Osmangazi University.

I began my career as an intern at AVKAR Yazılım; through part-time and then Junior Software Engineer roles I built end-to-end products for the healthcare and education sectors using React.js, React Native and Java/Spring Boot. I then joined Boxbilet as a Software Engineer, shipping CMS and management interfaces for the concert and event ticketing ecosystem, and continued at Paribu Biletleme as a Web App Engineer, building the admin panel of an event ticketing platform.

I focus on clean architecture, type-safe code with TypeScript and user-centered interfaces. More recently I've moved beyond the UI layer, building AI-powered tools and autonomous agents with Claude Code and the Claude Agent SDK. In my free time I enjoy puzzles, story-driven games and films/series.$bio_en$,
  '/assets/sezer.png',
  '{"github":"https://github.com/Fanthall","linkedin":"https://www.linkedin.com/in/sezer-demir-d-a8084b1b0/","instagram":"https://www.instagram.com/sezerdemirdedek/","gmail":"sezerddedek@gmail.com"}'::jsonb,
  'Front-End & AI Ajan Geliştirici',
  'Front-End & AI Agent Engineer',
  'Modern web arayüzleri kuruyor; Claude Code ve Agent SDK ile yapay zeka destekli araçlar ve ajanlar geliştiriyorum.',
  'I build modern web interfaces and craft AI-powered tools and agents with Claude Code and the Agent SDK.',
  7,
  '[{"titleTr":"Front-End","titleEn":"Front-End","items":["React.js","React Native","TypeScript","Next.js","Tailwind CSS"]},{"titleTr":"AI & Ajan Geliştirme","titleEn":"AI & Agent Development","items":["Claude Code","Claude Agent SDK","MCP","LLM Integration","Prompt Engineering"]},{"titleTr":"Back-End","titleEn":"Back-End","items":["Node.js","Java · Spring Boot","REST API","PostgreSQL","Supabase"]},{"titleTr":"Araçlar & Pratikler","titleEn":"Tools & Practices","items":["Git","OOP","Docker","Linux"]}]'::jsonb
) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- work_experience (CV)
-- ---------------------------------------------------------------------------
insert into work_experience (company_name, role_tr, role_en, desc_tr, desc_en, start_date, end_date, "order") values
  ('Paribu Biletleme A.Ş.', 'Web App Engineer', 'Web App Engineer',
   'Etkinlik biletleme ekosisteminde yönetim paneli ve web uygulaması geliştirme. Stack: TypeScript · React.js · Git · REST · OOP.',
   'Built the admin panel and web application for an event ticketing ecosystem. Stack: TypeScript · React.js · Git · REST · OOP.',
   '2025-08-01', '2026-05-31', 0),
  ('Boxbilet Yazılım Medya A.Ş.', 'Software Engineer', 'Software Engineer',
   'Konser/etkinlik satış standları için CMS ve yönetim arayüzleri. Stack: TypeScript · React.js · Git · REST · OOP.',
   'CMS and admin interfaces for concert/event sales stands. Stack: TypeScript · React.js · Git · REST · OOP.',
   '2024-07-01', '2025-08-31', 1),
  ('AVKAR Yazılım San. ve Tic. Ltd. Şti — Eskişehir/Odunpazarı', 'Junior Software Engineer', 'Junior Software Engineer',
   'Sağlık ve eğitim sektörü projeleri (RxMediaPharma, Osmangazi SEM, THD-TRD). Stack: Java · TypeScript · React Native · React.js · Git · REST · OOP.',
   'Healthcare and education sector projects (RxMediaPharma, Osmangazi SEM, THD-TRD). Stack: Java · TypeScript · React Native · React.js · Git · REST · OOP.',
   '2022-07-01', '2024-05-31', 2),
  ('AVKAR Yazılım San. ve Tic. Ltd. Şti — Eskişehir/Odunpazarı', 'Yarı Zamanlı Software Engineer', 'Part-Time Software Engineer',
   'Üniversite eğitimi sırasında web ve mobil projelerde yarı zamanlı rol. Stack: TypeScript · React Native · React.js · Git · REST · OOP.',
   'Part-time role on web and mobile projects during university. Stack: TypeScript · React Native · React.js · Git · REST · OOP.',
   '2021-08-01', '2022-07-31', 3),
  ('AVKAR Yazılım San. ve Tic. Ltd. Şti — Eskişehir/Odunpazarı', 'Stajyer', 'Intern',
   '20 iş günü zorunlu staj.', '20 business days mandatory internship.',
   '2021-07-01', '2021-08-31', 4),
  ('Pamukkale Üniversitesi — Bilgi İşlem Daire Başkanlığı, Denizli', 'Stajyer', 'Intern',
   '15 iş günü zorunlu staj.', '15 business days mandatory internship.',
   '2017-07-01', '2017-07-31', 5)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- project (ornek gercek projeler)
-- ---------------------------------------------------------------------------
insert into project (slug, title_tr, title_en, summary_tr, summary_en, desc_tr, desc_en, demo_type, repo_url, tags, is_featured, "order") values
  ('chat-view', 'Kick Chat View', 'Kick Chat View',
   'Kick canlı yayın sohbetini moderasyon panelleriyle birlikte gösteren masaüstü Electron uygulaması.',
   'Desktop Electron app that surfaces Kick live chat with moderation panels.',
   'React + Redux Toolkit + NextUI üzerine kurulu, Pusher WebSocket ile canlı chat dinleyen, 7TV emote desteği ve XSS-sertleştirilmiş render katmanı bulunan masaüstü istemci.',
   'React + Redux Toolkit + NextUI desktop client that listens to live chat via Pusher WebSocket, supports 7TV emotes and ships an XSS-hardened render layer.',
   'DOWNLOAD_ONLY', 'https://github.com/Fanthall/kick-chat-view',
   array['Electron','React','TypeScript','WebSocket'], true, 0),
  ('password-management', 'Password Management', 'Password Management',
   'NestJS + Prisma + Docker tabanlı modern parola kasası — AES-256-GCM ve Argon2id ile katmanlı şifreleme.',
   'Modern password vault built on NestJS + Prisma + Docker — layered crypto with AES-256-GCM and Argon2id.',
   'NestJS backend (helmet + throttler + CORS sertleştirme), Prisma + PostgreSQL veri katmanı, client tarafında masaüstü Electron istemci.',
   'NestJS backend (helmet + throttler + CORS hardened), Prisma + PostgreSQL data layer, Electron desktop client on the consumer side.',
   'GALLERY_ONLY', null,
   array['NestJS','Prisma','PostgreSQL','Docker','Electron','AES-256-GCM'], true, 1)
on conflict (slug) do nothing;

insert into project (slug, title_tr, title_en, summary_tr, summary_en, desc_tr, desc_en, demo_type, demo_url, tags, is_featured, "order") values
  ('quicktools', 'QuickTools', 'QuickTools',
   '22 araçlık, tamamen istemci-taraflı web araç paketi — statik export, çift dilli.',
   'A 22-tool, fully client-side web toolkit — static export, bilingual.',
   'Next.js + TypeScript + Tailwind ile kurulu, tamamen istemci-taraflı çalışan 22 araçlık paket. Statik export (SSR yok), çift dilli (TR/EN), her araç tarayıcıda çalışır — dosyalar sunucuya gitmez.',
   'A 22-tool suite built with Next.js + TypeScript + Tailwind, running fully client-side. Static export (no SSR), bilingual (TR/EN); every tool runs in the browser — files never leave the device.',
   'EXTERNAL_LINK', 'https://quicktools-app.netlify.app',
   array['Next.js','TypeScript','Tailwind','next-intl'], true, 2),
  ('stash', 'Stash', 'Stash',
   'Offline-first ev ve stok takip mobil uygulaması — bildirimler, istatistikler, çift dil.',
   'Offline-first home & stock tracking mobile app — reminders, stats, bilingual.',
   'React Native + Expo ile geliştirilen offline-first ev ve stok takip uygulaması. SQLite yerel veritabanı, bakım/son-kullanma hatırlatmaları, istatistikler ve çift dil desteği.',
   'An offline-first home & stock tracking app built with React Native + Expo. Local SQLite database, maintenance/expiry reminders, statistics and bilingual support.',
   'GALLERY_ONLY', null,
   array['React Native','Expo','SQLite','Zustand'], true, 3)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- page_seo (5 sayfa bos kayit)
-- ---------------------------------------------------------------------------
insert into page_seo (page_key) values ('HOME'),('ABOUT'),('CAREER'),('PROJECTS'),('CONTACT')
on conflict (page_key) do nothing;
