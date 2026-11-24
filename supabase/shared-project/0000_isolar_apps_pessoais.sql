-- =====================================================================
-- APLICAR ANTES DE ABRIR O CADASTRO DO CONEXÃO DIVINA
-- Projeto Supabase compartilhado (crm-entregas): CRM, Financeiro e StudyHub
-- também vivem aqui. Cada um desses apps tem um gatilho em auth.users que
-- cria perfil/categorias para QUALQUER novo usuário. Com o cadastro aberto
-- para os clientes do Conexão Divina, cada cliente ganharia linhas vazias
-- nesses apps pessoais.
--
-- Os apps pessoais têm um único usuário (o dono), que já existe; por isso os
-- gatilhos de "novo usuário" deles podem ser removidos com segurança.
-- Os dados existentes NÃO são alterados.
--
-- Confira antes no SQL editor:
--   select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;
-- =====================================================================

drop trigger if exists on_auth_user_created on auth.users;            -- CRM (public)
drop trigger if exists finance_on_auth_user_created on auth.users;    -- Financeiro
drop trigger if exists study_on_auth_user_created on auth.users;      -- StudyHub
