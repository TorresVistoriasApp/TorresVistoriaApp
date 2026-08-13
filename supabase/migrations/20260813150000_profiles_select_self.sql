-- Um membro autenticado precisa ler a própria linha em `profiles` pelo `id`.
-- A policy `profiles_select` só libera `tenant_id = get_user_tenant_id()`, o que
-- funciona quando o helper SECURITY DEFINER responde — mas qualquer falha nesse
-- caminho (sessão sem JWT atualizado, corrida no login) deixava o SELECT vazio.
-- O frontend interpretava isso como "conta sem empresa", mesmo com tenant_id
-- preenchido no banco.

DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
CREATE POLICY profiles_select_self ON public.profiles
  FOR SELECT
  USING (id = auth.uid() AND deleted_at IS NULL);
