-- Revoke RPC access to internal SECURITY DEFINER functions (Supabase advisor)

REVOKE ALL ON FUNCTION public.audit_log_changes() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_inspection_completed() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.assign_inspection_number() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_user_company_id() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_user_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC, anon, authenticated;
