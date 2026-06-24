-- Passo 6: LGPD — anonimização de conta (direito ao esquecimento)

CREATE OR REPLACE FUNCTION public.anonymize_user_account(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  IF auth.uid() <> p_user_id AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT company_id INTO v_company_id
  FROM public.profiles
  WHERE id = p_user_id AND deleted_at IS NULL;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Perfil não encontrado';
  END IF;

  UPDATE public.profiles
  SET
    full_name = 'Usuário excluído',
    avatar_url = NULL,
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO public.audit_logs (user_id, company_id, action, entity_type, entity_id, new_data)
  VALUES (
    p_user_id,
    v_company_id,
    'ACCOUNT_ANONYMIZED',
    'profiles',
    p_user_id,
    jsonb_build_object('anonymized_at', NOW())
  );
END;
$$;

REVOKE ALL ON FUNCTION public.anonymize_user_account(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.anonymize_user_account(UUID) TO authenticated;
