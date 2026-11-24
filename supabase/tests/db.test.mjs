import { PGlite } from '@electric-sql/pglite'
import fs from 'node:fs'

// Testa as migrações num PostgreSQL embutido (PGlite), simulando o Supabase.
// Uso: npm run test:db
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const MIG = path.join(path.dirname(fileURLToPath(import.meta.url)), '../migrations/')
const db = new PGlite()
await db.exec(`create schema auth;
create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create role authenticated; create role anon; create role service_role;
grant usage on schema auth to authenticated, anon; grant execute on function auth.uid() to authenticated, anon;
create schema storage; create table storage.buckets (id text primary key, name text, public bool, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text, owner uuid); alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name, '/') $$;`)

for (const f of fs.readdirSync(MIG).filter(f => f.endsWith('.sql')).sort()) {
  try { await db.exec(fs.readFileSync(MIG + f, 'utf8')); console.log('✔ migração', f) }
  catch (e) { console.log('✘ migração', f, e.message, e.position); process.exit(1) }
}

const A = '11111111-1111-1111-1111-111111111111', B = '22222222-2222-2222-2222-222222222222', ADM = '33333333-3333-3333-3333-333333333333'
await db.exec(`insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
 ('${A}', 'maria@ex.com', now(), '{"full_name":"Maria Silva"}'),
 ('${B}', 'joao@ex.com', null, '{"display_name":"João"}'),
 ('${ADM}', 'adm@ex.com', now(), '{}');`)

const q = async (s, p) => (await db.query(s, p)).rows
let fails = 0
const ok = (cond, label, extra = '') => { if (!cond) fails++; console.log(cond ? '  ok ' : '  FALHOU', label, extra) }
const as = async (role, uid) => db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false); set role ${role}; set search_path = conexao, public;`)
const expectErr = async (label, sql, p) => { try { await q(sql, p); ok(false, label, '(não bloqueou)') } catch (e) { ok(true, label, '→ ' + e.message.slice(0, 70)) } }

// --- Conteúdo de teste (como dono/postgres) ---
await db.exec(`reset role; set search_path = conexao, public;
insert into bible_translations (id, name, license, attribution, is_default) values ('teste', 'Tradução Teste', 'teste', 'teste', true);
insert into bible_verses (translation_id, book_id, chapter, verse, text, text_plain) values
 ('teste', 43, 3, 16, 'Porque Deus amou o mundo de tal maneira...', 'porque deus amou o mundo de tal maneira'),
 ('teste', 19, 23, 1, 'O Senhor é o meu pastor; nada me faltará.', 'o senhor e o meu pastor; nada me faltara');
insert into daily_words (title, verse_ref, verse_text, reflection, application, prayer, status, publish_date, in_rotation, created_at) values
 ('Hoje agendada', 'Sl 23:1', 'x', 'reflexão hoje', 'ap', 'or', 'published', app_today(), false, now()),
 ('Futura', 'Sl 23:1', 'x', 'segredo futuro', 'ap', 'or', 'published', app_today() + 3, false, now()),
 ('Rodízio 1', 'Sl 1:1', 'x', 'r1', 'ap', 'or', 'published', null, true, now() - interval '3 day'),
 ('Rodízio 2', 'Sl 1:2', 'x', 'r2', 'ap', 'or', 'published', null, true, now() - interval '2 day'),
 ('Premium rod', 'Sl 1:3', 'x', 'corpo premium', 'ap', 'or', 'published', null, true, now() - interval '1 day'),
 ('Rascunho', 'Sl 1:4', 'x', 'rascunho', 'ap', 'or', 'draft', null, true, now());
update daily_words set is_premium = true where title = 'Premium rod';
insert into categories (kind, slug, name) values ('prayer', 'manha', 'Oração da manhã');
insert into prayers (slug, title, body, status, is_premium) values ('livre', 'Oração livre', 'texto livre', 'published', false),
 ('prem', 'Oração premium', 'texto premium', 'published', true), ('rasc', 'Rascunho', 'x', 'draft', false);
insert into journeys (id, slug, title, description, duration_days, status, is_premium) values
 ('aaaaaaaa-0000-0000-0000-000000000001', 'sete', '7 dias', 'd', 2, 'published', false),
 ('aaaaaaaa-0000-0000-0000-000000000002', 'prem', 'Premium', 'd', 1, 'published', true);
insert into journey_days (id, journey_id, day_number, title) values
 ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 1, 'Dia 1'),
 ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 2, 'Dia 2'),
 ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', 1, 'P1');
insert into feelings (slug, label, welcome, verse_ref, verse_text, reflection, prayer, reading_ref) values
 ('ansioso', 'Ansioso', 'w', 'Fp 4:6', 'x', 'r', 'p', 'Salmos 23');
insert into subscriptions (customer_email, provider, provider_subscription_id, status, current_period_end)
 values ('MARIA@ex.com', 'kiwify', 'sub_1', 'active', now() + interval '30 day'),
        ('joao@ex.com', 'kiwify', 'sub_2', 'active', now() + interval '30 day');`)

console.log('\n[anônimo]')
await as('anon')
ok((await q(`select count(*)::int n from bible_verses`))[0].n === 2, 'lê a Bíblia')
ok((await q(`select count(*)::int n from bible_verses where fts @@ plainto_tsquery('portuguese', 'pastor')`))[0].n === 1, 'busca por palavra')
const w0 = (await q(`select * from daily_word_for()`))[0]
ok(w0?.title === 'Hoje agendada', 'palavra do dia = agendada para hoje', w0?.title)
ok((await q(`select * from daily_word_for(app_today() + 3)`)).length === 0, 'não revela palavra futura')
ok((await q(`select count(*)::int n from daily_words where title = 'Futura'`))[0].n === 0, 'RLS esconde agendada futura')
ok((await q(`select count(*)::int n from prayers`))[0].n === 1, 'vê só a oração gratuita publicada')
ok((await q(`select count(*)::int n from prayer_catalog`))[0].n === 2, 'catálogo lista a premium (sem corpo)')
await expectErr('não lê perfis', `select * from profiles`)
await expectErr('não lê jornadas', `select * from journeys`)

console.log('\n[Maria — e-mail confirmado, compra feita antes do cadastro]')
await as('authenticated', A)
ok((await q(`select has_premium() p`))[0].p === false, 'sem perfil ainda: sem premium')
const prof = (await q(`select * from ensure_profile()`))[0]
ok(prof.display_name === 'Maria', 'perfil criado com primeiro nome do Google', prof.display_name)
ok((await q(`select has_premium() p`))[0].p === true, 'compra vinculada pelo e-mail → premium')
await q(`select ensure_profile()`)
ok((await q(`select count(*)::int n from preferences`))[0].n === 1, 'ensure_profile é idempotente')
await expectErr('não muda o próprio papel', `update profiles set role = 'admin' where id = $1`, [A])
await expectErr('não se desbloqueia', `update profiles set access_status = 'active'`)
await q(`update profiles set display_name = 'Maria Clara', onboarding_done = true`)
ok(true, 'edita nome/onboarding')
await expectErr('não cria assinatura própria', `insert into subscriptions (user_id, provider, status) values ($1, 'manual', 'active')`, [A])
ok((await q(`select count(*)::int n from prayers`))[0].n === 2, 'premium: lê oração premium')
const rot = []
for (let i = 1; i <= 6; i++) rot.push((await q(`select title from daily_word_for(app_today() - ${i})`))[0]?.title)
ok(rot.every(Boolean) && new Set(rot).size === 3, 'rodízio cobre dias sem agendamento', rot.join(' | '))
await q(`insert into journal_entries (kind, body) values ('reflection', 'meu diário')`)
await q(`insert into prayer_requests (title, status) values ('Pela família', 'answered')`)
ok((await q(`select answered_at from prayer_requests`))[0].answered_at !== null, 'pedido respondido recebe data')
await q(`update prayer_requests set status = 'praying'`)
ok((await q(`select answered_at from prayer_requests`))[0].answered_at === null, 'voltar a "em oração" limpa a data')
await q(`insert into favorites (item_type, item_id, title) values ('prayer', 'x', 'y')`)
await q(`insert into bible_highlights (translation_id, book_id, chapter, verse, color) values ('teste', 19, 23, 1, 'gold')`)
await q(`insert into journey_day_completions (journey_day_id) values ('bbbbbbbb-0000-0000-0000-000000000001')`)
ok((await q(`select completed_at from user_journeys`))[0]?.completed_at === null, 'inscrita automaticamente, jornada em andamento')
await q(`insert into journey_day_completions (journey_day_id, journey_id) values ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002')`)
ok((await q(`select journey_id from journey_day_completions where journey_day_id = 'bbbbbbbb-0000-0000-0000-000000000002'`))[0].journey_id === 'aaaaaaaa-0000-0000-0000-000000000001', 'journey_id corrigido pelo trigger')
ok((await q(`select completed_at from user_journeys`))[0]?.completed_at !== null, 'último dia conclui a jornada')
await db.exec(`select log_activity('app_open'); select log_activity('app_open'); select log_activity('prayer', 'livre', 120)`)
const st = (await q(`select my_stats() s`))[0].s
ok(st.streak_days === 1 && st.prayers === 1 && st.journeys_completed === 1, 'estatísticas', JSON.stringify(st))
ok((await q(`select count(*)::int n from activity_log where kind = 'app_open'`))[0].n === 1, 'app_open 1x por dia')
ok((await q(`select array_agg(achievement_id order by achievement_id) a from user_achievements`))[0].a.includes('primeira_jornada'), 'conquistas concedidas')
await expectErr('não grava atividade direto', `insert into activity_log (kind) values ('prayer')`)
await expectErr('não chama admin_metrics', `select admin_metrics()`)
await expectErr('não lista usuários', `select * from admin_list_users()`)
await expectErr('não chama grant_achievements', `select grant_achievements($1)`, [B])

console.log('\n[João — e-mail NÃO confirmado, sem premium]')
await as('authenticated', B)
await q(`select ensure_profile()`)
ok((await q(`select has_premium() p`))[0].p === false, 'compra não vinculada sem e-mail confirmado')
ok((await q(`select has_premium($1) p`, [A]))[0].p === false, 'não descobre premium de outra pessoa')
ok((await q(`select count(*)::int n from journal_entries`))[0].n === 0, 'não vê diário da Maria')
ok((await q(`select count(*)::int n from prayer_requests`))[0].n === 0, 'não vê pedidos da Maria')
ok((await q(`select count(*)::int n from favorites`))[0].n === 0, 'não vê favoritos da Maria')
ok((await q(`select count(*)::int n from profiles`))[0].n === 1, 'só vê o próprio perfil')
await expectErr('diário bloqueado no gratuito', `insert into journal_entries (kind, body) values ('reflection', 'x')`)
await q(`insert into journal_entries (kind, body) values ('gratitude', 'grato pelo dia')`)
ok((await q(`select count(*)::int n from gratitude_entries`))[0].n === 1, 'gratidão liberada e na view')
ok((await q(`select count(*)::int n from prayers`))[0].n === 1, 'gratuito não lê oração premium')
ok((await q(`select count(*)::int n from journeys`))[0].n === 1, 'gratuito não lê jornada premium')
await expectErr('não conclui dia de jornada premium', `insert into journey_day_completions (journey_day_id) values ('bbbbbbbb-0000-0000-0000-000000000003')`)
// acha um dia em que o rodízio cai na premium
let lockedDay = null
for (let i = 1; i <= 6; i++) { const r = (await q(`select title, reflection, locked from daily_word_for(app_today() - ${i})`))[0]; if (r.title === 'Premium rod') { lockedDay = r; break } }
ok(lockedDay && lockedDay.locked === true && lockedDay.reflection === null, 'palavra premium vem trancada sem corpo', JSON.stringify(lockedDay))
await q(`update prayers set title = 'hack'`) // RLS: atualização ignorada (0 linhas), sem erro
ok((await q(`select count(*)::int n from prayers where title = 'hack'`))[0].n === 0, 'conteúdo intacto')

console.log('\n[Admin]')
await db.exec(`reset role; update conexao.profiles set role = 'admin' where id = '${ADM}';`).catch(() => {})
await as('authenticated', ADM)
await q(`select ensure_profile()`)
await db.exec(`reset role; update conexao.profiles set role = 'admin' where id = '${ADM}';`)
await as('authenticated', ADM)
const m = (await q(`select admin_metrics() m`))[0].m
ok(m.users_total === 3 && m.premium_users === 1, 'métricas agregadas', JSON.stringify({ t: m.users_total, p: m.premium_users, c: m.conversion_rate, pend: m.pending_purchases }))
const us = await q(`select * from admin_list_users('maria')`)
ok(us.length === 1 && us[0].is_premium === true, 'lista usuários com busca', us[0]?.email)
ok((await q(`select count(*)::int n from journal_entries`))[0].n === 0, 'admin NÃO lê diários')
ok((await q(`select count(*)::int n from prayer_requests`))[0].n === 0, 'admin NÃO lê pedidos de oração')
ok((await q(`select count(*)::int n from mood_checkins`))[0].n === 0, 'admin NÃO lê check-ins')
ok((await q(`select count(*)::int n from daily_words`))[0].n === 6, 'admin vê rascunhos e agendados')
ok((await q(`select count(*)::int n from daily_word_for(app_today() + 3)`))[0].n === 1, 'admin pré-visualiza dia futuro')
const sid = (await q(`select admin_grant_premium($1, null, 'cortesia') id`, [B]))[0].id
ok((await q(`select has_premium($1) p`, [B]))[0].p === true, 'liberação manual de premium')
await q(`select admin_set_access($1, 'blocked', 'teste')`, [B])
ok((await q(`select has_premium($1) p`, [B]))[0].p === false, 'bloqueado perde premium')
await q(`select admin_set_access($1, 'active')`, [B])
await q(`select admin_revoke_subscription($1)`, [sid])
ok((await q(`select has_premium($1) p`, [B]))[0].p === false, 'revogação remove premium')
await expectErr('admin não se bloqueia', `select admin_set_access($1, 'blocked')`, [ADM])
ok((await q(`select count(*)::int n from admin_audit_log`))[0].n === 4, 'ações auditadas')
await q(`insert into prayers (slug, title, body, status) values ('nova', 'Nova', 'b', 'draft')`)
ok(true, 'admin cria conteúdo')

console.log('\n[Exclusão de conta]')
await db.exec(`reset role; delete from auth.users where id = '${A}';`)
const left = (await q(`select (select count(*) from conexao.journal_entries)::int j, (select count(*) from conexao.prayer_requests)::int r,
  (select count(*) from conexao.favorites)::int f, (select count(*) from conexao.subscriptions where provider_subscription_id = 'sub_1')::int s`))[0]
ok(left.j === 1 && left.r === 0 && left.f === 0 && left.s === 0, 'apagar usuário remove os dados dele (resta só a gratidão do João)', JSON.stringify(left))

console.log(fails ? `\n${fails} FALHA(S)` : '\nTodos os testes passaram.')
process.exit(fails ? 1 : 0)
