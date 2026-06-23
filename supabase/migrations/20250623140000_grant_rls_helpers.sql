-- Helpers RLS: authenticated sim, anon não (evita RPC público)

GRANT EXECUTE ON FUNCTION public.get_user_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

REVOKE ALL ON FUNCTION public.get_user_company_id() FROM anon;
REVOKE ALL ON FUNCTION public.get_user_role() FROM anon;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM anon;
