-- Fase A — identificação segura do vistoriador, isolamento de anonimização
-- e bloqueio de hop de tenant_id no self-update (inclusive SUPER_ADMIN).
--
-- Dependências mapeadas:
--   * cadastro envia `document` em Auth metadata só para o trigger AFTER INSERT
--     (FK inspector_registrations.id → auth.users impede BEFORE INSERT).
--   * UI de pendência/aprovação usa document_hash + document_tail (nunca o original).
--   * Edge inspector-registrations casa CNPJ da empresa com document_hash.
--   * lgpdService.requestAccountDeletion → anonymize_user_account (self-delete LGPD).
--   * profiles_update_self + prevent_profile_self_escalation (self-update).
--   * Hashes SHA-256 já gravados não são conversíveis sem o documento original;
--     cadastros novos usam HMAC; a Edge casa HMAC e SHA-256 legado.

-- ---------------------------------------------------------------------------
-- 1. Pepper HMAC fora do schema public (sem USAGE para anon/authenticated/service_role)
-- ---------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS private.inspector_document_pepper (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  pepper BYTEA NOT NULL
);

ALTER TABLE private.inspector_document_pepper ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE private.inspector_document_pepper FROM PUBLIC, anon, authenticated, service_role;

INSERT INTO private.inspector_document_pepper (id, pepper)
SELECT 1, extensions.gen_random_bytes(32)
WHERE NOT EXISTS (
  SELECT 1 FROM private.inspector_document_pepper WHERE id = 1
);

CREATE OR REPLACE FUNCTION private.hmac_inspector_document(p_digits TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = private, extensions, pg_temp
AS $$
DECLARE
  v_pepper BYTEA;
BEGIN
  IF p_digits IS NULL OR btrim(p_digits) = '' THEN
    RAISE EXCEPTION 'Documento vazio para HMAC de vistoriador.'
      USING ERRCODE = '22023';
  END IF;

  SELECT pepper INTO STRICT v_pepper
  FROM private.inspector_document_pepper
  WHERE id = 1;

  RETURN encode(
    extensions.hmac(convert_to(p_digits, 'UTF8'), v_pepper, 'sha256'),
    'hex'
  );
END;
$$;

REVOKE ALL ON FUNCTION private.hmac_inspector_document(TEXT) FROM PUBLIC, anon, authenticated, service_role;

-- Wrapper só para service_role (Edge de aprovação). O trigger usa a função privada.
CREATE OR REPLACE FUNCTION public.hmac_inspector_document(p_digits TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = private, pg_temp
AS $$
  SELECT private.hmac_inspector_document(p_digits);
$$;

REVOKE ALL ON FUNCTION public.hmac_inspector_document(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hmac_inspector_document(TEXT) TO service_role;

CREATE OR REPLACE FUNCTION private.strip_auth_user_document(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_temp
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) - 'document'
  WHERE id = p_user_id
    AND COALESCE(raw_user_meta_data, '{}'::jsonb) ? 'document';
END;
$$;

REVOKE ALL ON FUNCTION private.strip_auth_user_document(UUID) FROM PUBLIC, anon, authenticated, service_role;

-- Cliente autenticado remove a chave da própria sessão (GoTrue faz merge e não apaga chaves).
CREATE OR REPLACE FUNCTION public.strip_own_auth_document_metadata()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado'
      USING ERRCODE = '28000';
  END IF;

  PERFORM private.strip_auth_user_document(auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION public.strip_own_auth_document_metadata() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.strip_own_auth_document_metadata() TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. handle_new_user — HMAC no document_hash e remoção do original no Auth
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_role public.tenant_role;
  v_must_change_password BOOLEAN;
  v_user_type TEXT;
  v_document_digits TEXT;
  v_document_type TEXT;
BEGIN
  IF COALESCE(NEW.raw_app_meta_data->>'is_platform_admin', 'false') = 'true' THEN
    INSERT INTO public.platform_admins (id, full_name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NEW.email
    );
    PERFORM private.strip_auth_user_document(NEW.id);
    RETURN NEW;
  END IF;

  v_user_type := COALESCE(
    NEW.raw_user_meta_data->>'user_type',
    NEW.raw_app_meta_data->>'user_type',
    ''
  );

  IF v_user_type = 'consumer' THEN
    INSERT INTO public.consumer_profiles (id, full_name, email, phone)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NEW.email,
      NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '')
    );
    PERFORM private.strip_auth_user_document(NEW.id);
    RETURN NEW;
  END IF;

  IF v_user_type = 'inspector' THEN
    v_document_type := COALESCE(NEW.raw_user_meta_data->>'document_type', '');
    v_document_digits := regexp_replace(COALESCE(NEW.raw_user_meta_data->>'document', ''), '\D', '', 'g');

    IF v_document_type NOT IN ('cpf', 'cnpj') THEN
      RAISE EXCEPTION 'Tipo de documento inválido para cadastro de vistoriador.'
        USING ERRCODE = '22023';
    END IF;

    IF v_document_type = 'cpf' AND length(v_document_digits) <> 11 THEN
      RAISE EXCEPTION 'CPF inválido para cadastro de vistoriador.'
        USING ERRCODE = '22023';
    END IF;

    IF v_document_type = 'cnpj' AND length(v_document_digits) <> 14 THEN
      RAISE EXCEPTION 'CNPJ inválido para cadastro de vistoriador.'
        USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.inspector_registrations (
      id,
      full_name,
      email,
      phone,
      document_type,
      document_hash,
      document_tail,
      status
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NEW.email,
      NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), ''),
      v_document_type,
      private.hmac_inspector_document(v_document_digits),
      right(v_document_digits, 4),
      'pending_approval'
    );
    PERFORM private.strip_auth_user_document(NEW.id);
    RETURN NEW;
  END IF;

  v_tenant_id := COALESCE(
    NEW.raw_app_meta_data->>'tenant_id',
    NEW.raw_app_meta_data->>'company_id'
  )::UUID;
  v_role := public.normalize_tenant_role(NEW.raw_app_meta_data->>'role');
  v_must_change_password := COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false);

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Cadastro exige tenant_id explícito no metadata do usuário, user_type consumer ou inspector.';
  END IF;

  INSERT INTO public.profiles (
    id, tenant_id, full_name, role, email, must_change_password, is_active
  )
  VALUES (
    NEW.id,
    v_tenant_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    v_role,
    NEW.email,
    v_must_change_password,
    true
  );

  PERFORM private.strip_auth_user_document(NEW.id);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Backfill: remove CPF/CNPJ original já persistido em sessões antigas.
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) - 'document'
WHERE COALESCE(raw_user_meta_data, '{}'::jsonb) ? 'document';

-- ---------------------------------------------------------------------------
-- 3. prevent_profile_self_escalation — SUPER_ADMIN não troca o próprio tenant_id
-- ---------------------------------------------------------------------------
-- service_role (auth.uid() nulo) e update de OUTRO usuário continuam permitidos.
-- profiles_admin WITH CHECK no tenant do admin impede mover colega para outra empresa.

CREATE OR REPLACE FUNCTION public.prevent_profile_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM auth.uid() THEN
    RETURN NEW;
  END IF;

  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
     OR NEW.role IS DISTINCT FROM OLD.role
     OR NEW.is_active IS DISTINCT FROM OLD.is_active
     OR NEW.status IS DISTINCT FROM OLD.status
  THEN
    RAISE EXCEPTION 'Função, empresa e status do perfil não podem ser alterados pelo próprio usuário.'
      USING ERRCODE = '42501';
  END IF;

  IF NOT public.is_super_admin() AND NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'E-mail do perfil só pode ser alterado por um administrador.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_profile_self_escalation() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. anonymize_user_account — self LGPD ou SUPER_ADMIN do mesmo tenant
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.anonymize_user_account(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT tenant_id INTO v_tenant_id
  FROM public.profiles
  WHERE id = p_user_id AND deleted_at IS NULL;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Perfil não encontrado';
  END IF;

  IF auth.uid() = p_user_id THEN
    NULL;
  ELSIF public.is_super_admin()
        AND public.get_user_tenant_id() IS NOT DISTINCT FROM v_tenant_id THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  UPDATE public.profiles
  SET
    full_name = 'Usuário excluído',
    avatar_url = NULL,
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id;

  PERFORM private.strip_auth_user_document(p_user_id);

  INSERT INTO public.audit_logs (user_id, tenant_id, action, entity_type, entity_id, new_data)
  VALUES (
    p_user_id,
    v_tenant_id,
    'ACCOUNT_ANONYMIZED',
    'profiles',
    p_user_id,
    jsonb_build_object('anonymized_at', NOW())
  );
END;
$$;

REVOKE ALL ON FUNCTION public.anonymize_user_account(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.anonymize_user_account(UUID) TO authenticated;
