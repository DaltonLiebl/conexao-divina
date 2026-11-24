-- =====================================================================
-- Conexão Divina — schema principal (0001)
-- Schema dedicado `conexao`, dentro de um projeto Supabase compartilhado.
--
-- Princípios:
--  * Todo dado pessoal tem RLS "somente o próprio usuário".
--  * Administradores NÃO têm política de leitura sobre diário, pedidos de
--    oração, check-ins de sentimento, anotações bíblicas e conversas com a IA.
--    O painel só vê agregados, através de funções SECURITY DEFINER.
--  * Conteúdo premium: as linhas premium só são lidas por quem tem acesso;
--    o catálogo (título, capa, categoria) sai por views sem o corpo do texto.
--  * Um usuário só "existe" no app quando tem linha em conexao.profiles
--    (criada por conexao.ensure_profile() no primeiro acesso), porque o
--    auth.users é compartilhado com outros apps do mesmo projeto.
-- =====================================================================

create schema if not exists conexao;
grant usage on schema conexao to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------

-- "Hoje" no fuso do Brasil: define qual conteúdo diário aparece.
create or replace function conexao.app_today() returns date
language sql stable as $$
  select (now() at time zone 'America/Sao_Paulo')::date
$$;

create or replace function conexao.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------
-- Perfis e preferências
-- ---------------------------------------------------------------------

create table conexao.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  display_name     text check (display_name is null or char_length(trim(display_name)) between 1 and 60),
  avatar_url       text,
  role             text not null default 'user' check (role in ('user', 'editor', 'admin')),
  access_status    text not null default 'active' check (access_status in ('active', 'blocked')),
  blocked_reason   text,
  onboarding_done  boolean not null default false,
  accepted_terms_at timestamptz,
  last_seen_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger profiles_touch before update on conexao.profiles
  for each row execute function conexao.touch_updated_at();

-- Funções de papel. SECURITY DEFINER para não depender da RLS de profiles.
create or replace function conexao.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from conexao.profiles
    where id = (select auth.uid()) and role = 'admin' and access_status = 'active'
  )
$$;

create or replace function conexao.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from conexao.profiles
    where id = (select auth.uid()) and role in ('admin', 'editor') and access_status = 'active'
  )
$$;

create table conexao.preferences (
  user_id          uuid primary key references conexao.profiles (id) on delete cascade,
  -- respostas do onboarding (todas opcionais)
  seeking          text[] not null default '{}'
                   check (seeking <@ array['fe', 'oracao', 'paz', 'biblia', 'esperanca', 'direcao', 'gratidao']::text[]),
  daily_minutes    smallint check (daily_minutes is null or daily_minutes between 1 and 180),
  message_time     time,
  timezone         text not null default 'America/Sao_Paulo',
  -- aparência e acessibilidade
  theme            text not null default 'system' check (theme in ('system', 'light', 'dark')),
  font_scale       numeric(3,2) not null default 1.00 check (font_scale between 0.85 and 1.60),
  reduce_motion    boolean not null default false,
  bible_translation text,
  updated_at       timestamptz not null default now()
);
create trigger preferences_touch before update on conexao.preferences
  for each row execute function conexao.touch_updated_at();

-- ---------------------------------------------------------------------
-- Configurações do app (não guardar segredos aqui: segredos ficam em
-- variáveis de ambiente do servidor)
-- ---------------------------------------------------------------------

create table conexao.app_settings (
  key         text primary key check (key ~ '^[a-z0-9_.]+$'),
  value       jsonb not null,
  is_public   boolean not null default false,
  description text,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references conexao.profiles (id) on delete set null
);
create trigger app_settings_touch before update on conexao.app_settings
  for each row execute function conexao.touch_updated_at();

insert into conexao.app_settings (key, value, is_public, description) values
  ('access.free_features',
   '["daily_word", "daily_verse", "bible_basic", "prayers_selected", "heart", "prayer_requests", "progress"]',
   true, 'Recursos liberados no plano gratuito. Os demais exigem premium.'),
  ('ai.daily_limit_premium', '30', false, 'Mensagens por dia no Guia da Fé (premium).'),
  ('ai.daily_limit_free', '0', false, 'Mensagens por dia no Guia da Fé (gratuito). 0 = indisponível.'),
  ('brand.support_email', 'null', true, 'E-mail de suporte exibido no app e na política de privacidade.'),
  ('payments.active_provider', 'null', false, 'kiwify | hotmart | cakto | stripe');

-- ---------------------------------------------------------------------
-- Planos, assinaturas, pagamentos
-- ---------------------------------------------------------------------

create table conexao.plans (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name          text not null,
  description   text,
  billing       text not null check (billing in ('monthly', 'yearly', 'lifetime')),
  price_cents   integer not null check (price_cents >= 0),
  compare_at_cents integer check (compare_at_cents is null or compare_at_cents >= 0),
  currency      text not null default 'BRL',
  highlights    text[] not null default '{}',
  provider      text check (provider in ('kiwify', 'hotmart', 'cakto', 'stripe')),
  provider_product_id text,          -- id do produto/oferta/price no provedor
  checkout_url  text,                -- link de checkout do provedor
  is_active     boolean not null default true,
  sort_order    smallint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (provider, provider_product_id)
);
create trigger plans_touch before update on conexao.plans
  for each row execute function conexao.touch_updated_at();

create table conexao.subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references conexao.profiles (id) on delete cascade,
  -- compra feita antes do cadastro: fica "pendente" pelo e-mail e é
  -- vinculada quando a pessoa cria a conta com o mesmo e-mail confirmado.
  customer_email text,
  plan_id       uuid references conexao.plans (id) on delete set null,
  provider      text not null check (provider in ('kiwify', 'hotmart', 'cakto', 'stripe', 'manual')),
  provider_subscription_id text,
  status        text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'refunded', 'chargeback', 'expired')),
  current_period_end timestamptz,    -- null = vitalício / sem expiração
  started_at    timestamptz not null default now(),
  canceled_at   timestamptz,
  granted_by    uuid references conexao.profiles (id) on delete set null,  -- liberação manual
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (user_id is not null or customer_email is not null),
  unique (provider, provider_subscription_id)
);
create index subscriptions_user_idx on conexao.subscriptions (user_id);
create index subscriptions_email_idx on conexao.subscriptions (lower(customer_email)) where user_id is null;
create trigger subscriptions_touch before update on conexao.subscriptions
  for each row execute function conexao.touch_updated_at();

create table conexao.payments (
  id            uuid primary key default gen_random_uuid(),
  subscription_id uuid references conexao.subscriptions (id) on delete set null,
  user_id       uuid references conexao.profiles (id) on delete set null,
  customer_email text,
  provider      text not null,
  provider_payment_id text not null,
  amount_cents  integer,
  currency      text default 'BRL',
  status        text not null,       -- status normalizado: paid | refunded | chargeback | pending | failed
  paid_at       timestamptz,
  created_at    timestamptz not null default now(),
  unique (provider, provider_payment_id)
);
create index payments_user_idx on conexao.payments (user_id);

-- Registro bruto de webhooks: idempotência e auditoria.
create table conexao.webhook_events (
  id            uuid primary key default gen_random_uuid(),
  provider      text not null,
  event_id      text not null,
  event_type    text,
  payload       jsonb not null,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz,
  error         text,
  unique (provider, event_id)
);

-- Tem acesso premium agora?
create or replace function conexao.has_premium(uid uuid default null) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from conexao.subscriptions s
    join conexao.profiles p on p.id = s.user_id
    where s.user_id = coalesce(uid, (select auth.uid()))
      -- só consulta a si mesmo, salvo administrador
      and (uid is null or uid = (select auth.uid())
           or exists (select 1 from conexao.profiles a where a.id = (select auth.uid()) and a.role = 'admin'))
      and p.access_status = 'active'
      and (
        (s.status in ('active', 'trialing') and (s.current_period_end is null or s.current_period_end > now()))
        -- cancelada: mantém o acesso até o fim do período já pago
        or (s.status = 'canceled' and s.current_period_end > now())
      )
  )
$$;

-- Um recurso está liberado para o usuário atual? (gratuito pela config ou premium)
create or replace function conexao.has_feature(feature text) returns boolean
language sql stable security definer set search_path = '' as $$
  select
    exists (select 1 from conexao.profiles where id = (select auth.uid()) and access_status = 'active')
    and (
      coalesce((select value ? feature from conexao.app_settings where key = 'access.free_features'), false)
      or conexao.has_premium((select auth.uid()))
    )
$$;

-- ---------------------------------------------------------------------
-- Bíblia (texto de fonte licenciada, importado por script)
-- ---------------------------------------------------------------------

create table conexao.bible_translations (
  id          text primary key check (id ~ '^[a-z0-9-]+$'),  -- ex.: 'blivre'
  name        text not null,
  language    text not null default 'pt-BR',
  license     text not null,                 -- ex.: 'Domínio público', 'CC BY 3.0 BR'
  attribution text not null,                 -- texto de crédito exibido no leitor
  source_url  text,
  is_default  boolean not null default false,
  is_active   boolean not null default true
);
create unique index bible_translations_one_default on conexao.bible_translations (is_default) where is_default;

create table conexao.bible_books (
  id          smallint primary key check (id between 1 and 66),
  slug        text not null unique,
  abbrev      text not null unique,
  name        text not null,
  testament   text not null check (testament in ('AT', 'NT')),
  chapters    smallint not null check (chapters > 0)
);

insert into conexao.bible_books (id, slug, abbrev, name, testament, chapters) values
 (1,'genesis','Gn','Gênesis','AT',50),(2,'exodo','Êx','Êxodo','AT',40),(3,'levitico','Lv','Levítico','AT',27),
 (4,'numeros','Nm','Números','AT',36),(5,'deuteronomio','Dt','Deuteronômio','AT',34),(6,'josue','Js','Josué','AT',24),
 (7,'juizes','Jz','Juízes','AT',21),(8,'rute','Rt','Rute','AT',4),(9,'1-samuel','1Sm','1 Samuel','AT',31),
 (10,'2-samuel','2Sm','2 Samuel','AT',24),(11,'1-reis','1Rs','1 Reis','AT',22),(12,'2-reis','2Rs','2 Reis','AT',25),
 (13,'1-cronicas','1Cr','1 Crônicas','AT',29),(14,'2-cronicas','2Cr','2 Crônicas','AT',36),(15,'esdras','Ed','Esdras','AT',10),
 (16,'neemias','Ne','Neemias','AT',13),(17,'ester','Et','Ester','AT',10),(18,'jo','Jó','Jó','AT',42),
 (19,'salmos','Sl','Salmos','AT',150),(20,'proverbios','Pv','Provérbios','AT',31),(21,'eclesiastes','Ec','Eclesiastes','AT',12),
 (22,'cantares','Ct','Cânticos','AT',8),(23,'isaias','Is','Isaías','AT',66),(24,'jeremias','Jr','Jeremias','AT',52),
 (25,'lamentacoes','Lm','Lamentações','AT',5),(26,'ezequiel','Ez','Ezequiel','AT',48),(27,'daniel','Dn','Daniel','AT',12),
 (28,'oseias','Os','Oseias','AT',14),(29,'joel','Jl','Joel','AT',3),(30,'amos','Am','Amós','AT',9),
 (31,'obadias','Ob','Obadias','AT',1),(32,'jonas','Jn','Jonas','AT',4),(33,'miqueias','Mq','Miqueias','AT',7),
 (34,'naum','Na','Naum','AT',3),(35,'habacuque','Hc','Habacuque','AT',3),(36,'sofonias','Sf','Sofonias','AT',3),
 (37,'ageu','Ag','Ageu','AT',2),(38,'zacarias','Zc','Zacarias','AT',14),(39,'malaquias','Ml','Malaquias','AT',4),
 (40,'mateus','Mt','Mateus','NT',28),(41,'marcos','Mc','Marcos','NT',16),(42,'lucas','Lc','Lucas','NT',24),
 (43,'joao','Jo','João','NT',21),(44,'atos','At','Atos','NT',28),(45,'romanos','Rm','Romanos','NT',16),
 (46,'1-corintios','1Co','1 Coríntios','NT',16),(47,'2-corintios','2Co','2 Coríntios','NT',13),(48,'galatas','Gl','Gálatas','NT',6),
 (49,'efesios','Ef','Efésios','NT',6),(50,'filipenses','Fp','Filipenses','NT',4),(51,'colossenses','Cl','Colossenses','NT',4),
 (52,'1-tessalonicenses','1Ts','1 Tessalonicenses','NT',5),(53,'2-tessalonicenses','2Ts','2 Tessalonicenses','NT',3),
 (54,'1-timoteo','1Tm','1 Timóteo','NT',6),(55,'2-timoteo','2Tm','2 Timóteo','NT',4),(56,'tito','Tt','Tito','NT',3),
 (57,'filemom','Fm','Filemom','NT',1),(58,'hebreus','Hb','Hebreus','NT',13),(59,'tiago','Tg','Tiago','NT',5),
 (60,'1-pedro','1Pe','1 Pedro','NT',5),(61,'2-pedro','2Pe','2 Pedro','NT',3),(62,'1-joao','1Jo','1 João','NT',5),
 (63,'2-joao','2Jo','2 João','NT',1),(64,'3-joao','3Jo','3 João','NT',1),(65,'judas','Jd','Judas','NT',1),
 (66,'apocalipse','Ap','Apocalipse','NT',22);

create table conexao.bible_verses (
  translation_id text not null references conexao.bible_translations (id) on delete cascade,
  book_id     smallint not null references conexao.bible_books (id),
  chapter     smallint not null check (chapter > 0),
  verse       smallint not null check (verse > 0),
  text        text not null,
  -- versão minúscula e sem acentos, gerada pelo script de importação,
  -- para a busca encontrar "fe" e "fé" igualmente
  text_plain  text not null,
  fts         tsvector generated always as (to_tsvector('portuguese', text_plain)) stored,
  primary key (translation_id, book_id, chapter, verse)
);
create index bible_verses_fts_idx on conexao.bible_verses using gin (fts);

-- ---------------------------------------------------------------------
-- Mídia (imagens e áudios) e categorias
-- ---------------------------------------------------------------------

create table conexao.categories (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('prayer', 'journey', 'audio', 'request')),
  slug        text not null check (slug ~ '^[a-z0-9-]+$'),
  name        text not null,
  description text,
  icon        text,                   -- nome de ícone Lucide
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  unique (kind, slug)
);

create table conexao.media_assets (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('image', 'audio')),
  bucket      text not null,
  path        text not null,
  title       text,
  alt_text    text,
  credit      text,                   -- autoria / fonte
  license     text,                   -- licença de uso (obrigatório preencher antes de publicar)
  duration_seconds integer,
  created_by  uuid references conexao.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (bucket, path)
);

create table conexao.audios (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('music', 'nature', 'narrated_prayer', 'reflection')),
  title       text not null,
  description text,
  category_id uuid references conexao.categories (id) on delete set null,
  asset_id    uuid not null references conexao.media_assets (id) on delete restrict,
  cover_image_url text,
  is_premium  boolean not null default true,
  status      text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  publish_at  timestamptz,
  is_demo     boolean not null default false,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger audios_touch before update on conexao.audios
  for each row execute function conexao.touch_updated_at();

create table conexao.banners (
  id          uuid primary key default gen_random_uuid(),
  placement   text not null check (placement in ('home', 'premium', 'peace')),
  title       text not null,
  subtitle    text,
  image_url   text,
  link_url    text,
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_active   boolean not null default true,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Conteúdo diário (calendário editorial)
-- ---------------------------------------------------------------------

create table conexao.daily_words (
  id            uuid primary key default gen_random_uuid(),
  publish_date  date unique,          -- null = só entra no rodízio
  title         text not null,
  cover_image_url text,
  verse_ref     text not null,        -- ex.: 'Salmos 23:1'
  verse_text    text not null,
  reflection    text not null,
  application   text not null,        -- aplicação prática
  prayer        text not null,
  reading_minutes smallint not null default 3 check (reading_minutes between 1 and 60),
  audio_id      uuid references conexao.audios (id) on delete set null,
  in_rotation   boolean not null default true,  -- usado quando não há conteúdo agendado para o dia
  is_premium    boolean not null default false,
  status        text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_demo       boolean not null default false,
  created_by    uuid references conexao.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger daily_words_touch before update on conexao.daily_words
  for each row execute function conexao.touch_updated_at();

create table conexao.daily_verses (
  id            uuid primary key default gen_random_uuid(),
  publish_date  date unique,
  book_id       smallint not null references conexao.bible_books (id),
  chapter       smallint not null,
  verse_start   smallint not null,
  verse_end     smallint,
  translation_id text references conexao.bible_translations (id) on delete set null,
  verse_text    text not null,        -- cópia do texto na tradução indicada
  context       text not null,
  reflection    text not null,
  application   text not null,
  in_rotation   boolean not null default true,
  status        text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_demo       boolean not null default false,
  created_by    uuid references conexao.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (verse_end is null or verse_end >= verse_start)
);
create trigger daily_verses_touch before update on conexao.daily_verses
  for each row execute function conexao.touch_updated_at();

-- Conteúdo do dia: o agendado para a data; se não houver, um do rodízio,
-- escolhido de forma determinística pela data (todos veem o mesmo).
-- Datas futuras só para a equipe. Palavra premium sem acesso volta com o
-- corpo vazio e locked = true (o app mostra o convite para o premium).
create or replace function conexao.daily_word_for(d date default null)
returns table (id uuid, publish_date date, title text, cover_image_url text, verse_ref text, verse_text text,
               reflection text, application text, prayer text, reading_minutes smallint, audio_id uuid,
               is_premium boolean, is_demo boolean, for_date date, locked boolean)
language plpgsql stable security definer set search_path = '' as $$
declare
  v_day date := coalesce(d, conexao.app_today());
  v_row conexao.daily_words;
  v_total int;
  v_locked boolean;
begin
  if v_day > conexao.app_today() and not conexao.is_staff() then
    return;
  end if;

  select * into v_row from conexao.daily_words w
   where w.status = 'published' and w.publish_date = v_day;

  if not found then
    select count(*) into v_total from conexao.daily_words w
     where w.status = 'published' and w.in_rotation and (w.publish_date is null or w.publish_date <= v_day);
    if v_total = 0 then return; end if;
    select * into v_row from conexao.daily_words w
     where w.status = 'published' and w.in_rotation and (w.publish_date is null or w.publish_date <= v_day)
     order by w.created_at, w.id
     offset ((((v_day - date '2024-01-01') % v_total) + v_total) % v_total) limit 1;
  end if;

  v_locked := v_row.is_premium and not (conexao.has_premium() or conexao.is_staff());
  return query select v_row.id, v_row.publish_date, v_row.title, v_row.cover_image_url, v_row.verse_ref,
    v_row.verse_text,
    case when v_locked then null else v_row.reflection end,
    case when v_locked then null else v_row.application end,
    case when v_locked then null else v_row.prayer end,
    v_row.reading_minutes,
    case when v_locked then null else v_row.audio_id end,
    v_row.is_premium, v_row.is_demo, v_day, v_locked;
end $$;

create or replace function conexao.daily_verse_for(d date default null)
returns table (id uuid, publish_date date, book_id smallint, chapter smallint, verse_start smallint, verse_end smallint,
               translation_id text, verse_text text, context text, reflection text, application text,
               is_demo boolean, for_date date)
language plpgsql stable security definer set search_path = '' as $$
declare
  v_day date := coalesce(d, conexao.app_today());
  v_row conexao.daily_verses;
  v_total int;
begin
  if v_day > conexao.app_today() and not conexao.is_staff() then
    return;
  end if;

  select * into v_row from conexao.daily_verses v
   where v.status = 'published' and v.publish_date = v_day;

  if not found then
    select count(*) into v_total from conexao.daily_verses v
     where v.status = 'published' and v.in_rotation and (v.publish_date is null or v.publish_date <= v_day);
    if v_total = 0 then return; end if;
    select * into v_row from conexao.daily_verses v
     where v.status = 'published' and v.in_rotation and (v.publish_date is null or v.publish_date <= v_day)
     order by v.created_at, v.id
     offset ((((v_day - date '2024-01-01') % v_total) + v_total) % v_total) limit 1;
  end if;

  return query select v_row.id, v_row.publish_date, v_row.book_id, v_row.chapter, v_row.verse_start, v_row.verse_end,
    v_row.translation_id, v_row.verse_text, v_row.context, v_row.reflection, v_row.application, v_row.is_demo, v_day;
end $$;

-- ---------------------------------------------------------------------
-- Orações, sentimentos e jornadas
-- ---------------------------------------------------------------------

create table conexao.prayers (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid references conexao.categories (id) on delete set null,
  slug          text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title         text not null,
  summary       text,
  body          text not null,
  verse_ref     text,
  image_url     text,
  audio_id      uuid references conexao.audios (id) on delete set null,
  moment        text check (moment in ('morning', 'night')),  -- oração da manhã/noite na home
  reading_minutes smallint not null default 2,
  is_premium    boolean not null default false,
  is_featured   boolean not null default false,
  status        text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  publish_at    timestamptz,
  is_demo       boolean not null default false,
  sort_order    smallint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index prayers_category_idx on conexao.prayers (category_id);
create trigger prayers_touch before update on conexao.prayers
  for each row execute function conexao.touch_updated_at();

create table conexao.feelings (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]+$'),
  label         text not null,         -- 'Ansioso'
  icon          text,
  tone          text not null default 'calm' check (tone in ('joy', 'calm', 'heavy')),
  welcome       text not null,         -- mensagem de acolhimento
  verse_ref     text not null,
  verse_text    text not null,
  reflection    text not null,
  prayer        text not null,
  reading_ref   text not null,         -- sugestão de leitura bíblica (ex.: 'Salmos 23')
  reading_book_id smallint references conexao.bible_books (id),
  reading_chapter smallint,
  is_active     boolean not null default true,
  is_demo       boolean not null default false,
  sort_order    smallint not null default 0,
  updated_at    timestamptz not null default now()
);
create trigger feelings_touch before update on conexao.feelings
  for each row execute function conexao.touch_updated_at();

create table conexao.journeys (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title         text not null,
  subtitle      text,
  description   text not null,
  cover_image_url text,
  category_id   uuid references conexao.categories (id) on delete set null,
  duration_days smallint not null check (duration_days between 1 and 366),
  minutes_per_day smallint not null default 10,
  is_premium    boolean not null default true,
  status        text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  publish_at    timestamptz,
  is_demo       boolean not null default false,
  sort_order    smallint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger journeys_touch before update on conexao.journeys
  for each row execute function conexao.touch_updated_at();

create table conexao.journey_days (
  id            uuid primary key default gen_random_uuid(),
  journey_id    uuid not null references conexao.journeys (id) on delete cascade,
  day_number    smallint not null check (day_number > 0),
  title         text not null,
  verse_ref     text,
  verse_text    text,
  reading_ref   text,                 -- leitura bíblica do dia (ex.: 'Gênesis 1-3')
  reflection    text,
  prayer        text,
  updated_at    timestamptz not null default now(),
  unique (journey_id, day_number)
);
create trigger journey_days_touch before update on conexao.journey_days
  for each row execute function conexao.touch_updated_at();

-- Conteúdo publicado e visível agora (sem considerar premium)
create or replace function conexao.is_live(st text, pub timestamptz) returns boolean
language sql stable as $$
  select st = 'published' and (pub is null or pub <= now())
$$;

-- ---------------------------------------------------------------------
-- Dados pessoais do usuário
-- ---------------------------------------------------------------------

create table conexao.favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  item_type   text not null check (item_type in ('daily_word', 'daily_verse', 'prayer', 'bible_verse', 'journey', 'audio', 'feeling')),
  item_id     text not null,           -- uuid do conteúdo, ou 'traducao:livro:cap:vers' para a Bíblia
  title       text,                    -- cópia para listar sem joins
  created_at  timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create table conexao.bible_highlights (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  translation_id text not null references conexao.bible_translations (id) on delete cascade,
  book_id     smallint not null references conexao.bible_books (id),
  chapter     smallint not null,
  verse       smallint not null,
  color       text not null check (color in ('gold', 'green', 'blue', 'rose', 'lilac')),
  created_at  timestamptz not null default now(),
  unique (user_id, translation_id, book_id, chapter, verse)
);

create table conexao.bible_notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  book_id     smallint not null references conexao.bible_books (id),
  chapter     smallint not null,
  verse       smallint,
  body        text not null check (char_length(body) between 1 and 10000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index bible_notes_user_idx on conexao.bible_notes (user_id, book_id, chapter);
create trigger bible_notes_touch before update on conexao.bible_notes
  for each row execute function conexao.touch_updated_at();

-- Histórico de leitura (também alimenta "continuar de onde parou")
create table conexao.bible_reading_log (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  translation_id text not null references conexao.bible_translations (id) on delete cascade,
  book_id     smallint not null references conexao.bible_books (id),
  chapter     smallint not null,
  read_at     timestamptz not null default now()
);
create index bible_reading_log_user_idx on conexao.bible_reading_log (user_id, read_at desc);

create table conexao.journal_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  kind        text not null check (kind in ('reflection', 'feeling', 'experience', 'prayer', 'learning', 'gratitude', 'bible_note')),
  title       text check (title is null or char_length(title) <= 200),
  body        text not null check (char_length(body) between 1 and 20000),
  feeling_id  uuid references conexao.feelings (id) on delete set null,
  verse_ref   text,
  entry_date  date not null default conexao.app_today(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index journal_entries_user_idx on conexao.journal_entries (user_id, entry_date desc);
create trigger journal_entries_touch before update on conexao.journal_entries
  for each row execute function conexao.touch_updated_at();

-- Registros de gratidão = entradas do diário do tipo 'gratitude'
create view conexao.gratitude_entries with (security_invoker = true) as
  select id, user_id, body, entry_date, created_at
  from conexao.journal_entries where kind = 'gratitude';

create table conexao.prayer_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  title       text not null check (char_length(trim(title)) between 1 and 200),
  description text check (description is null or char_length(description) <= 10000),
  category    text not null default 'outro'
              check (category in ('familia', 'saude', 'trabalho', 'financas', 'relacionamentos', 'fe', 'outro')),
  status      text not null default 'praying' check (status in ('praying', 'waiting', 'answered')),
  request_date date not null default conexao.app_today(),
  notes       text check (notes is null or char_length(notes) <= 10000),
  answered_at date,
  testimony   text check (testimony is null or char_length(testimony) <= 20000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index prayer_requests_user_idx on conexao.prayer_requests (user_id, status);
create trigger prayer_requests_touch before update on conexao.prayer_requests
  for each row execute function conexao.touch_updated_at();

-- Marca/desmarca a data de resposta junto com o status
create or replace function conexao.prayer_request_answered() returns trigger
language plpgsql as $$
begin
  if new.status = 'answered' and new.answered_at is null then
    new.answered_at := conexao.app_today();
  elsif new.status <> 'answered' then
    new.answered_at := null;
  end if;
  return new;
end $$;
create trigger prayer_requests_answered before insert or update of status on conexao.prayer_requests
  for each row execute function conexao.prayer_request_answered();

create table conexao.mood_checkins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  feeling_id  uuid not null references conexao.feelings (id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index mood_checkins_user_idx on conexao.mood_checkins (user_id, created_at desc);

-- Jornadas do usuário
create table conexao.user_journeys (
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  journey_id  uuid not null references conexao.journeys (id) on delete cascade,
  started_at  timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, journey_id)
);

create table conexao.journey_day_completions (
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  journey_day_id uuid not null references conexao.journey_days (id) on delete cascade,
  journey_id  uuid not null references conexao.journeys (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, journey_day_id)
);

-- Garante journey_id coerente, inscreve automaticamente e conclui a jornada
create or replace function conexao.on_journey_day_completed() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_total int;
  v_done  int;
begin
  select journey_id into new.journey_id from conexao.journey_days where id = new.journey_day_id;
  if new.journey_id is null then
    raise exception 'Dia de jornada inexistente';
  end if;
  insert into conexao.user_journeys (user_id, journey_id)
    values (new.user_id, new.journey_id) on conflict do nothing;
  return new;
end $$;
create trigger journey_day_completions_before before insert on conexao.journey_day_completions
  for each row execute function conexao.on_journey_day_completed();

create or replace function conexao.refresh_journey_completion() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  r record;
  v_total int;
  v_done int;
begin
  r := coalesce(new, old);
  select count(*) into v_total from conexao.journey_days where journey_id = r.journey_id;
  select count(*) into v_done from conexao.journey_day_completions
    where user_id = r.user_id and journey_id = r.journey_id;
  update conexao.user_journeys
     set completed_at = case when v_total > 0 and v_done >= v_total then coalesce(completed_at, now()) else null end
   where user_id = r.user_id and journey_id = r.journey_id;
  return null;
end $$;
create trigger journey_day_completions_after after insert or delete on conexao.journey_day_completions
  for each row execute function conexao.refresh_journey_completion();

-- Atividades (base dos dias consecutivos, estatísticas e calendário)
create table conexao.activity_log (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  kind        text not null check (kind in ('app_open', 'daily_word', 'daily_verse', 'prayer', 'bible_chapter',
                                            'journey_day', 'peace_session', 'journal_entry', 'heart_checkin')),
  ref         text,
  duration_seconds integer not null default 0 check (duration_seconds between 0 and 86400),
  local_date  date not null default conexao.app_today(),
  occurred_at timestamptz not null default now()
);
create index activity_log_user_idx on conexao.activity_log (user_id, local_date desc);
create index activity_log_date_idx on conexao.activity_log (local_date);

create table conexao.user_goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  kind        text not null check (kind in ('days_per_week', 'minutes_per_day', 'chapters_per_week', 'prayers_per_week')),
  target      smallint not null check (target between 1 and 1000),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (user_id, kind)
);

create table conexao.achievements (
  id          text primary key check (id ~ '^[a-z0-9_]+$'),
  title       text not null,
  description text not null,
  icon        text not null,
  sort_order  smallint not null default 0
);

insert into conexao.achievements (id, title, description, icon, sort_order) values
  ('primeiro_passo', 'Primeiro passo', 'Você começou sua jornada no Conexão Divina.', 'sprout', 1),
  ('sete_dias', 'Sete dias de encontro', 'Esteve presente em 7 dias diferentes.', 'sunrise', 2),
  ('trinta_dias', 'Um mês de caminhada', 'Esteve presente em 30 dias diferentes.', 'mountain', 3),
  ('primeira_jornada', 'Jornada concluída', 'Concluiu sua primeira jornada espiritual.', 'flag', 4),
  ('leitor_dedicado', 'Leitor da Palavra', 'Leu 50 capítulos da Bíblia.', 'book-open', 5),
  ('coracao_grato', 'Coração grato', 'Registrou 10 motivos de gratidão.', 'heart', 6),
  ('momento_de_paz', 'Momento de paz', 'Dedicou 60 minutos ao Momento de Paz.', 'leaf', 7);

create table conexao.user_achievements (
  user_id     uuid not null references conexao.profiles (id) on delete cascade,
  achievement_id text not null references conexao.achievements (id) on delete cascade,
  earned_at   timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ---------------------------------------------------------------------
-- Notificações
-- ---------------------------------------------------------------------

create table conexao.reminders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  kind        text not null check (kind in ('daily_word', 'daily_verse', 'morning_prayer', 'night_prayer', 'journey', 'gratitude')),
  local_time  time not null,
  weekdays    smallint[] not null default '{0,1,2,3,4,5,6}' check (weekdays <@ '{0,1,2,3,4,5,6}'::smallint[]),
  is_enabled  boolean not null default true,
  last_sent_on date,
  created_at  timestamptz not null default now(),
  unique (user_id, kind)
);

create table conexao.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth_key    text not null,
  user_agent  text,
  created_at  timestamptz not null default now(),
  last_used_at timestamptz
);

-- Envios em massa feitos pelo administrador
create table conexao.notifications (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) <= 80),
  body        text not null check (char_length(body) <= 240),
  url         text,
  audience    text not null default 'all' check (audience in ('all', 'free', 'premium')),
  scheduled_for timestamptz not null default now(),
  status      text not null default 'scheduled' check (status in ('draft', 'scheduled', 'sending', 'sent', 'failed', 'canceled')),
  sent_count  integer not null default 0,
  failed_count integer not null default 0,
  sent_at     timestamptz,
  created_by  uuid references conexao.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Guia da Fé (assistente de IA)
-- ---------------------------------------------------------------------

create table conexao.ai_conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index ai_conversations_user_idx on conexao.ai_conversations (user_id, updated_at desc);

create table conexao.ai_messages (
  id          uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conexao.ai_conversations (id) on delete cascade,
  user_id     uuid not null default auth.uid() references conexao.profiles (id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null check (char_length(content) <= 20000),
  created_at  timestamptz not null default now()
);
create index ai_messages_conv_idx on conexao.ai_messages (conversation_id, created_at);

-- ---------------------------------------------------------------------
-- Auditoria do painel
-- ---------------------------------------------------------------------

create table conexao.admin_audit_log (
  id          bigint generated always as identity primary key,
  admin_id    uuid references conexao.profiles (id) on delete set null,
  action      text not null,
  target_type text,
  target_id   text,
  details     jsonb,
  created_at  timestamptz not null default now()
);

create or replace function conexao.audit(p_action text, p_target_type text, p_target_id text, p_details jsonb)
returns void language sql security definer set search_path = '' as $$
  insert into conexao.admin_audit_log (admin_id, action, target_type, target_id, details)
  values ((select auth.uid()), p_action, p_target_type, p_target_id, p_details)
$$;

-- =====================================================================
-- Funções de aplicação (RPC)
-- =====================================================================

-- Cria o perfil no primeiro acesso e vincula compras feitas antes do
-- cadastro (somente se o e-mail estiver confirmado).
create or replace function conexao.ensure_profile() returns conexao.profiles
language plpgsql security definer set search_path = '' as $$
declare
  v_uid  uuid := (select auth.uid());
  v_user record;
  v_profile conexao.profiles;
begin
  if v_uid is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;

  select id, email, email_confirmed_at, raw_user_meta_data into v_user from auth.users where id = v_uid;

  insert into conexao.profiles (id, display_name, avatar_url)
  values (
    v_uid,
    nullif(left(trim(coalesce(v_user.raw_user_meta_data ->> 'display_name',
                              split_part(coalesce(v_user.raw_user_meta_data ->> 'full_name',
                                                  v_user.raw_user_meta_data ->> 'name', ''), ' ', 1))), 60), ''),
    v_user.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into conexao.preferences (user_id) values (v_uid) on conflict (user_id) do nothing;

  if v_user.email is not null and v_user.email_confirmed_at is not null then
    update conexao.subscriptions
       set user_id = v_uid
     where user_id is null and lower(customer_email) = lower(v_user.email);
    update conexao.payments
       set user_id = v_uid
     where user_id is null and lower(customer_email) = lower(v_user.email);
  end if;

  update conexao.profiles set last_seen_at = now() where id = v_uid
    returning * into v_profile;
  return v_profile;
end $$;

-- Registra atividade e concede conquistas simbólicas.
create or replace function conexao.log_activity(p_kind text, p_ref text default null, p_duration integer default 0)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'Não autenticado' using errcode = '28000'; end if;

  -- app_open: no máximo um por dia
  if p_kind = 'app_open' and exists (
    select 1 from conexao.activity_log where user_id = v_uid and kind = 'app_open' and local_date = conexao.app_today()
  ) then
    return;
  end if;

  insert into conexao.activity_log (user_id, kind, ref, duration_seconds)
  values (v_uid, p_kind, p_ref, greatest(0, least(coalesce(p_duration, 0), 86400)));

  perform conexao.grant_achievements(v_uid);
end $$;

create or replace function conexao.grant_achievements(p_uid uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_days int;
  v_chapters int;
  v_gratitude int;
  v_peace int;
begin
  select count(distinct local_date) into v_days from conexao.activity_log where user_id = p_uid;
  select count(*) into v_chapters from conexao.activity_log where user_id = p_uid and kind = 'bible_chapter';
  select count(*) into v_gratitude from conexao.journal_entries where user_id = p_uid and kind = 'gratitude';
  select coalesce(sum(duration_seconds), 0) into v_peace from conexao.activity_log where user_id = p_uid and kind = 'peace_session';

  insert into conexao.user_achievements (user_id, achievement_id)
  select p_uid, a from unnest(array[
    case when v_days >= 1 then 'primeiro_passo' end,
    case when v_days >= 7 then 'sete_dias' end,
    case when v_days >= 30 then 'trinta_dias' end,
    case when v_chapters >= 50 then 'leitor_dedicado' end,
    case when v_gratitude >= 10 then 'coracao_grato' end,
    case when v_peace >= 3600 then 'momento_de_paz' end,
    case when exists (select 1 from conexao.user_journeys where user_id = p_uid and completed_at is not null)
         then 'primeira_jornada' end
  ]) a
  where a is not null
  on conflict do nothing;
end $$;

-- Estatísticas do próprio usuário (sem ranking, sem pontuação de fé)
create or replace function conexao.my_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_today date := conexao.app_today();
  v_streak int := 0;
  v_day date;
begin
  if v_uid is null then raise exception 'Não autenticado' using errcode = '28000'; end if;

  -- dias consecutivos terminando hoje (ou ontem, se ainda não abriu hoje)
  v_day := case when exists (select 1 from conexao.activity_log where user_id = v_uid and local_date = v_today)
                then v_today else v_today - 1 end;
  while exists (select 1 from conexao.activity_log where user_id = v_uid and local_date = v_day) loop
    v_streak := v_streak + 1;
    v_day := v_day - 1;
  end loop;

  return jsonb_build_object(
    'streak_days', v_streak,
    'active_days', (select count(distinct local_date) from conexao.activity_log where user_id = v_uid),
    'prayers', (select count(*) from conexao.activity_log where user_id = v_uid and kind = 'prayer'),
    'verses', (select count(*) from conexao.activity_log where user_id = v_uid and kind = 'daily_verse'),
    'chapters', (select count(*) from conexao.activity_log where user_id = v_uid and kind = 'bible_chapter'),
    'journeys_completed', (select count(*) from conexao.user_journeys where user_id = v_uid and completed_at is not null),
    'minutes', (select coalesce(sum(duration_seconds), 0) / 60 from conexao.activity_log where user_id = v_uid),
    'is_premium', conexao.has_premium(v_uid)
  );
end $$;

-- ---------------------------------------------------------------------
-- Funções do painel administrativo (somente agregados / sem dados privados)
-- ---------------------------------------------------------------------

create or replace function conexao.admin_metrics() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_total int;
  v_premium int;
begin
  if not conexao.is_staff() then raise exception 'Acesso negado' using errcode = '42501'; end if;
  select count(*) into v_total from conexao.profiles;
  select count(distinct s.user_id) into v_premium from conexao.subscriptions s
    where s.user_id is not null and conexao.has_premium(s.user_id);
  return jsonb_build_object(
    'users_total', v_total,
    'users_new_7d', (select count(*) from conexao.profiles where created_at > now() - interval '7 days'),
    'active_1d', (select count(distinct user_id) from conexao.activity_log where local_date = conexao.app_today()),
    'active_7d', (select count(distinct user_id) from conexao.activity_log where local_date > conexao.app_today() - 7),
    'active_30d', (select count(distinct user_id) from conexao.activity_log where local_date > conexao.app_today() - 30),
    'premium_users', v_premium,
    'conversion_rate', case when v_total = 0 then 0 else round(v_premium::numeric * 100 / v_total, 1) end,
    'pending_purchases', (select count(*) from conexao.subscriptions where user_id is null and status in ('active', 'trialing')),
    'signups_by_day', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d, 'count', n) order by d), '[]')
      from (select (created_at at time zone 'America/Sao_Paulo')::date d, count(*) n
            from conexao.profiles where created_at > now() - interval '30 days' group by 1) x),
    'active_by_day', (
      select coalesce(jsonb_agg(jsonb_build_object('day', local_date, 'count', n) order by local_date), '[]')
      from (select local_date, count(distinct user_id) n from conexao.activity_log
            where local_date > conexao.app_today() - 30 group by 1) y),
    'usage_by_kind_30d', (
      select coalesce(jsonb_object_agg(kind, n), '{}')
      from (select kind, count(*) n from conexao.activity_log
            where local_date > conexao.app_today() - 30 group by 1) z)
  );
end $$;

-- Lista de usuários para o painel: dados de conta, nunca conteúdo privado.
create or replace function conexao.admin_list_users(p_search text default null, p_limit int default 50, p_offset int default 0)
returns table (
  id uuid, email text, display_name text, role text, access_status text,
  is_premium boolean, created_at timestamptz, last_seen_at timestamptz, total_count bigint
) language plpgsql stable security definer set search_path = '' as $$
begin
  if not conexao.is_admin() then raise exception 'Acesso negado' using errcode = '42501'; end if;
  return query
    select p.id, u.email::text, p.display_name, p.role, p.access_status,
           conexao.has_premium(p.id), p.created_at, p.last_seen_at,
           count(*) over ()
    from conexao.profiles p
    join auth.users u on u.id = p.id
    where p_search is null or p_search = ''
       or u.email ilike '%' || p_search || '%'
       or p.display_name ilike '%' || p_search || '%'
    order by p.created_at desc
    limit least(greatest(p_limit, 1), 200) offset greatest(p_offset, 0);
end $$;

create or replace function conexao.admin_set_access(p_user uuid, p_status text, p_reason text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not conexao.is_admin() then raise exception 'Acesso negado' using errcode = '42501'; end if;
  if p_user = (select auth.uid()) then raise exception 'Você não pode bloquear a própria conta'; end if;
  update conexao.profiles
     set access_status = p_status, blocked_reason = case when p_status = 'blocked' then p_reason end
   where id = p_user;
  perform conexao.audit('set_access', 'user', p_user::text, jsonb_build_object('status', p_status, 'reason', p_reason));
end $$;

create or replace function conexao.admin_set_role(p_user uuid, p_role text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not conexao.is_admin() then raise exception 'Acesso negado' using errcode = '42501'; end if;
  if p_user = (select auth.uid()) and p_role <> 'admin' then
    raise exception 'Você não pode remover o próprio papel de administrador';
  end if;
  update conexao.profiles set role = p_role where id = p_user;
  perform conexao.audit('set_role', 'user', p_user::text, jsonb_build_object('role', p_role));
end $$;

-- Liberação manual de premium (cortesia, suporte). p_until null = sem expiração.
create or replace function conexao.admin_grant_premium(p_user uuid, p_until timestamptz, p_notes text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not conexao.is_admin() then raise exception 'Acesso negado' using errcode = '42501'; end if;
  insert into conexao.subscriptions (user_id, provider, status, current_period_end, granted_by, notes)
  values (p_user, 'manual', 'active', p_until, (select auth.uid()), p_notes)
  returning id into v_id;
  perform conexao.audit('grant_premium', 'user', p_user::text, jsonb_build_object('until', p_until, 'notes', p_notes));
  return v_id;
end $$;

create or replace function conexao.admin_revoke_subscription(p_subscription uuid, p_notes text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not conexao.is_admin() then raise exception 'Acesso negado' using errcode = '42501'; end if;
  update conexao.subscriptions
     set status = 'expired', current_period_end = now(), canceled_at = now(),
         notes = coalesce(p_notes, notes)
   where id = p_subscription;
  perform conexao.audit('revoke_subscription', 'subscription', p_subscription::text, jsonb_build_object('notes', p_notes));
end $$;

-- =====================================================================
-- Views de catálogo (metadados sem o corpo do conteúdo premium)
-- Rodam com o dono da view para listar itens premium "trancados".
-- =====================================================================

create view conexao.prayer_catalog as
  select p.id, p.slug, p.title, p.summary, p.image_url, p.category_id, p.moment, p.reading_minutes,
         p.is_premium, p.is_featured, p.is_demo, p.sort_order, (p.audio_id is not null) as has_audio
  from conexao.prayers p
  where conexao.is_live(p.status, p.publish_at);

create view conexao.journey_catalog as
  select j.id, j.slug, j.title, j.subtitle, j.description, j.cover_image_url, j.category_id,
         j.duration_days, j.minutes_per_day, j.is_premium, j.is_demo, j.sort_order
  from conexao.journeys j
  where conexao.is_live(j.status, j.publish_at);

create view conexao.audio_catalog as
  select a.id, a.kind, a.title, a.description, a.category_id, a.cover_image_url,
         m.duration_seconds, a.is_premium, a.is_demo, a.sort_order
  from conexao.audios a
  join conexao.media_assets m on m.id = a.asset_id
  where conexao.is_live(a.status, a.publish_at);

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table conexao.profiles               enable row level security;
alter table conexao.preferences            enable row level security;
alter table conexao.app_settings           enable row level security;
alter table conexao.plans                  enable row level security;
alter table conexao.subscriptions          enable row level security;
alter table conexao.payments               enable row level security;
alter table conexao.webhook_events         enable row level security;
alter table conexao.bible_translations     enable row level security;
alter table conexao.bible_books            enable row level security;
alter table conexao.bible_verses           enable row level security;
alter table conexao.categories             enable row level security;
alter table conexao.media_assets           enable row level security;
alter table conexao.audios                 enable row level security;
alter table conexao.banners                enable row level security;
alter table conexao.daily_words            enable row level security;
alter table conexao.daily_verses           enable row level security;
alter table conexao.prayers                enable row level security;
alter table conexao.feelings               enable row level security;
alter table conexao.journeys               enable row level security;
alter table conexao.journey_days           enable row level security;
alter table conexao.favorites              enable row level security;
alter table conexao.bible_highlights       enable row level security;
alter table conexao.bible_notes            enable row level security;
alter table conexao.bible_reading_log      enable row level security;
alter table conexao.journal_entries        enable row level security;
alter table conexao.prayer_requests        enable row level security;
alter table conexao.mood_checkins          enable row level security;
alter table conexao.user_journeys          enable row level security;
alter table conexao.journey_day_completions enable row level security;
alter table conexao.activity_log           enable row level security;
alter table conexao.user_goals             enable row level security;
alter table conexao.achievements           enable row level security;
alter table conexao.user_achievements      enable row level security;
alter table conexao.reminders              enable row level security;
alter table conexao.push_subscriptions     enable row level security;
alter table conexao.notifications          enable row level security;
alter table conexao.ai_conversations       enable row level security;
alter table conexao.ai_messages            enable row level security;
alter table conexao.admin_audit_log        enable row level security;

-- Perfis: cada um vê o seu; admin vê todos (só dados de conta).
create policy profiles_select on conexao.profiles for select to authenticated
  using (id = (select auth.uid()) or conexao.is_admin());
create policy profiles_update on conexao.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy preferences_own on conexao.preferences for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Configurações: públicas para todos; o restante só para admin.
create policy app_settings_read on conexao.app_settings for select to anon, authenticated
  using (is_public or conexao.is_admin());
create policy app_settings_admin on conexao.app_settings for all to authenticated
  using (conexao.is_admin()) with check (conexao.is_admin());

-- Planos: ativos são públicos (página de upgrade).
create policy plans_read on conexao.plans for select to anon, authenticated
  using (is_active or conexao.is_admin());
create policy plans_admin on conexao.plans for all to authenticated
  using (conexao.is_admin()) with check (conexao.is_admin());

-- Assinaturas e pagamentos: o usuário vê as suas; escrita só via servidor/admin RPC.
create policy subscriptions_read on conexao.subscriptions for select to authenticated
  using (user_id = (select auth.uid()) or conexao.is_admin());
create policy payments_read on conexao.payments for select to authenticated
  using (user_id = (select auth.uid()) or conexao.is_admin());
create policy webhook_events_admin on conexao.webhook_events for select to authenticated
  using (conexao.is_admin());

-- Bíblia: leitura pública.
create policy bible_translations_read on conexao.bible_translations for select to anon, authenticated
  using (is_active or conexao.is_staff());
create policy bible_books_read on conexao.bible_books for select to anon, authenticated using (true);
create policy bible_verses_read on conexao.bible_verses for select to anon, authenticated using (true);

-- Conteúdo editorial: leitura conforme publicação/premium; escrita pela equipe.
create policy categories_read on conexao.categories for select to anon, authenticated
  using (is_active or conexao.is_staff());
create policy categories_staff on conexao.categories for all to authenticated
  using (conexao.is_staff()) with check (conexao.is_staff());

create policy media_assets_read on conexao.media_assets for select to authenticated
  using (conexao.is_staff());
create policy media_assets_staff on conexao.media_assets for all to authenticated
  using (conexao.is_staff()) with check (conexao.is_staff());

create policy audios_read on conexao.audios for select to authenticated
  using (conexao.is_staff()
         or (conexao.is_live(status, publish_at) and (not is_premium or conexao.has_premium())));
create policy audios_staff on conexao.audios for all to authenticated
  using (conexao.is_staff()) with check (conexao.is_staff());

create policy banners_read on conexao.banners for select to anon, authenticated
  using (conexao.is_staff()
         or (is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())));
create policy banners_staff on conexao.banners for all to authenticated
  using (conexao.is_staff()) with check (conexao.is_staff());

-- Palavra / versículo: publicados e com data até hoje (não revela agendados futuros).
create policy daily_words_read on conexao.daily_words for select to anon, authenticated
  using (conexao.is_staff()
         or (status = 'published' and (publish_date is null or publish_date <= conexao.app_today())
             and (not is_premium or conexao.has_premium())));
create policy daily_words_staff on conexao.daily_words for all to authenticated
  using (conexao.is_staff()) with check (conexao.is_staff());

create policy daily_verses_read on conexao.daily_verses for select to anon, authenticated
  using (conexao.is_staff()
         or (status = 'published' and (publish_date is null or publish_date <= conexao.app_today())));
create policy daily_verses_staff on conexao.daily_verses for all to authenticated
  using (conexao.is_staff()) with check (conexao.is_staff());

create policy prayers_read on conexao.prayers for select to anon, authenticated
  using (conexao.is_staff()
         or (conexao.is_live(status, publish_at) and (not is_premium or conexao.has_premium())));
create policy prayers_staff on conexao.prayers for all to authenticated
  using (conexao.is_staff()) with check (conexao.is_staff());

create policy feelings_read on conexao.feelings for select to anon, authenticated
  using (is_active or conexao.is_staff());
create policy feelings_staff on conexao.feelings for all to authenticated
  using (conexao.is_staff()) with check (conexao.is_staff());

create policy journeys_read on conexao.journeys for select to authenticated
  using (conexao.is_staff()
         or (conexao.is_live(status, publish_at) and (not is_premium or conexao.has_premium())));
create policy journeys_staff on conexao.journeys for all to authenticated
  using (conexao.is_staff()) with check (conexao.is_staff());

create policy journey_days_read on conexao.journey_days for select to authenticated
  using (conexao.is_staff() or exists (
    select 1 from conexao.journeys j where j.id = journey_id
      and conexao.is_live(j.status, j.publish_at) and (not j.is_premium or conexao.has_premium())));
create policy journey_days_staff on conexao.journey_days for all to authenticated
  using (conexao.is_staff()) with check (conexao.is_staff());

-- Dados pessoais: somente o dono. (Sem política para admin, de propósito.)
create policy favorites_own on conexao.favorites for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy bible_highlights_own on conexao.bible_highlights for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy bible_notes_own on conexao.bible_notes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy bible_reading_log_own on conexao.bible_reading_log for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy mood_checkins_own on conexao.mood_checkins for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy prayer_requests_own on conexao.prayer_requests for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy user_goals_own on conexao.user_goals for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy reminders_own on conexao.reminders for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy push_subscriptions_own on conexao.push_subscriptions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy user_achievements_read on conexao.user_achievements for select to authenticated
  using (user_id = (select auth.uid()));
create policy achievements_read on conexao.achievements for select to authenticated using (true);

-- Diário: ler/editar/apagar sempre (os dados são do usuário, LGPD);
-- criar exige o recurso 'journal' (premium, salvo se liberado como gratuito).
create policy journal_select on conexao.journal_entries for select to authenticated
  using (user_id = (select auth.uid()));
create policy journal_insert on conexao.journal_entries for insert to authenticated
  with check (user_id = (select auth.uid()) and (kind = 'gratitude' or conexao.has_feature('journal')));
create policy journal_update on conexao.journal_entries for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy journal_delete on conexao.journal_entries for delete to authenticated
  using (user_id = (select auth.uid()));

-- Jornadas: progresso do próprio usuário; só inicia jornada que pode ler.
create policy user_journeys_select on conexao.user_journeys for select to authenticated
  using (user_id = (select auth.uid()));
create policy user_journeys_insert on conexao.user_journeys for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from conexao.journeys j where j.id = journey_id));
create policy user_journeys_delete on conexao.user_journeys for delete to authenticated
  using (user_id = (select auth.uid()));
create policy jdc_select on conexao.journey_day_completions for select to authenticated
  using (user_id = (select auth.uid()));
create policy jdc_insert on conexao.journey_day_completions for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from conexao.journey_days d where d.id = journey_day_id));
create policy jdc_delete on conexao.journey_day_completions for delete to authenticated
  using (user_id = (select auth.uid()));

-- Atividades: leitura própria; escrita via conexao.log_activity().
create policy activity_log_select on conexao.activity_log for select to authenticated
  using (user_id = (select auth.uid()));

-- IA: o próprio usuário lê e apaga; mensagens são gravadas pelo servidor.
create policy ai_conversations_own on conexao.ai_conversations for select to authenticated
  using (user_id = (select auth.uid()));
create policy ai_conversations_delete on conexao.ai_conversations for delete to authenticated
  using (user_id = (select auth.uid()));
create policy ai_messages_own on conexao.ai_messages for select to authenticated
  using (user_id = (select auth.uid()));

create policy notifications_staff on conexao.notifications for all to authenticated
  using (conexao.is_admin()) with check (conexao.is_admin());
create policy admin_audit_log_read on conexao.admin_audit_log for select to authenticated
  using (conexao.is_admin());

-- =====================================================================
-- Permissões (projetos novos não concedem nada automaticamente)
-- =====================================================================

grant select on all tables in schema conexao to anon, authenticated;
grant insert, update, delete on all tables in schema conexao to authenticated;
grant all on all tables in schema conexao to service_role;
grant usage, select on all sequences in schema conexao to authenticated, service_role;
grant execute on all functions in schema conexao to authenticated, service_role;

-- anon: só conteúdo público
revoke select on conexao.profiles, conexao.preferences, conexao.subscriptions, conexao.payments,
  conexao.webhook_events, conexao.media_assets, conexao.audios, conexao.journeys, conexao.journey_days,
  conexao.favorites, conexao.bible_highlights, conexao.bible_notes, conexao.bible_reading_log,
  conexao.journal_entries, conexao.gratitude_entries, conexao.prayer_requests, conexao.mood_checkins,
  conexao.user_journeys, conexao.journey_day_completions, conexao.activity_log, conexao.user_goals,
  conexao.achievements, conexao.user_achievements, conexao.reminders, conexao.push_subscriptions,
  conexao.notifications, conexao.ai_conversations, conexao.ai_messages, conexao.admin_audit_log,
  conexao.audio_catalog
  from anon;

-- Perfil: o usuário só altera campos inofensivos (papel e bloqueio só via RPC de admin).
revoke update on conexao.profiles from authenticated;
grant update (display_name, avatar_url, onboarding_done, accepted_terms_at) on conexao.profiles to authenticated;

-- Tabelas escritas apenas pelo servidor (service_role) ou por RPCs.
revoke insert, update, delete on conexao.subscriptions, conexao.payments, conexao.webhook_events,
  conexao.activity_log, conexao.user_achievements, conexao.achievements, conexao.ai_messages,
  conexao.admin_audit_log, conexao.bible_verses, conexao.bible_books, conexao.profiles
  from authenticated;
revoke insert on conexao.ai_conversations from authenticated;
grant update (display_name, avatar_url, onboarding_done, accepted_terms_at) on conexao.profiles to authenticated;
revoke update, delete on conexao.journey_day_completions from authenticated;
grant delete on conexao.journey_day_completions to authenticated;
revoke update on conexao.user_journeys from authenticated;

-- Funções internas não expostas como RPC
revoke execute on function conexao.grant_achievements(uuid) from public, anon, authenticated;
revoke execute on function conexao.audit(text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function conexao.touch_updated_at() from public, anon, authenticated;
revoke execute on function conexao.on_journey_day_completed() from public, anon, authenticated;
revoke execute on function conexao.refresh_journey_completion() from public, anon, authenticated;
revoke execute on function conexao.prayer_request_answered() from public, anon, authenticated;
-- Funções de leitura pública usadas por anon (landing e SEO)
grant execute on function conexao.daily_word_for(date), conexao.daily_verse_for(date),
  conexao.app_today(), conexao.is_live(text, timestamptz), conexao.has_premium(uuid),
  conexao.is_staff(), conexao.is_admin() to anon;

-- Novas tabelas criadas em migrações futuras herdam as permissões básicas.
alter default privileges in schema conexao grant select on tables to authenticated;
alter default privileges in schema conexao grant all on tables to service_role;
alter default privileges in schema conexao grant execute on functions to authenticated, service_role;
