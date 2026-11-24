-- Exclusão da própria conta (LGPD). Apaga o usuário em auth.users; as tabelas do app
-- ligadas a ele (inclusive assinaturas) são removidas em cascata. Pagamentos ficam com user_id nulo (registro fiscal).
create or replace function conexao.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;
  delete from auth.users where id = v_uid;
end $$;

revoke all on function conexao.delete_my_account() from public, anon;
grant execute on function conexao.delete_my_account() to authenticated;
