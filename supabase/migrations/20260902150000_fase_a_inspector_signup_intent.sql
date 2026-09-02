-- Cadastro de vistoriador deixa de passar CPF/CNPJ pelo Auth metadata.
-- A Edge inspector-signup grava só HMAC+tail numa intent privada; o trigger
-- consome a intent no INSERT do usuário. Auth nunca persiste o documento.

CREATE TABLE IF NOT EXISTS private.inspector_signup_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_hash TEXT NOT NULL,
  document_tail TEXT NOT NULL CHECK (length(document_tail) = 4),
  document_type TEXT NOT NULL CHECK (document_type IN ('cpf', 'cnpj')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

REVOKE ALL ON TABLE private.inspector_signup_intents FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.prepare_inspector_signup(
  p_digits TEXT,
  p_document_type TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, pg_temp
AS $$
DECLARE
  v_digits TEXT;
  v_id UUID;
BEGIN
  v_digits := regexp_replace(COALESCE(p_digits, ''), '\D', '', 'g');

  IF p_document_type NOT IN ('cpf', 'cnpj') THEN
    RAISE EXCEPTION 'Tipo de documento inválido para cadastro de vistoriador.'
      USING ERRCODE = '22023';
  END IF;

  IF p_document_type = 'cpf' AND length(v_digits) <> 11 THEN
    RAISE EXCEPTION 'CPF inválido para cadastro de vistoriador.'
      USING ERRCODE = '22023';
  END IF;

  IF p_document_type = 'cnpj' AND length(v_digits) <> 14 THEN
    RAISE EXCEPTION 'CNPJ inválido para cadastro de vistoriador.'
      USING ERRCODE = '22023';
  END IF;

  DELETE FROM private.inspector_signup_intents
  WHERE created_at < NOW() - INTERVAL '15 minutes';

  INSERT INTO private.inspector_signup_intents (
    document_hash,
    document_tail,
    document_type
  )
  VALUES (
    private.hmac_inspector_document(v_digits),
    right(v_digits, 4),
    p_document_type
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.prepare_inspector_signup(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prepare_inspector_signup(TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.discard_inspector_signup_intent(p_intent_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = private, pg_temp
AS $$
  DELETE FROM private.inspector_signup_intents WHERE id = p_intent_id;
$$;

REVOKE ALL ON FUNCTION public.discard_inspector_signup_intent(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.discard_inspector_signup_intent(UUID) TO service_role;

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
  v_intent_id UUID;
  v_document_hash TEXT;
  v_document_tail TEXT;
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
    BEGIN
      v_intent_id := NULLIF(NEW.raw_user_meta_data->>'signup_intent_id', '')::UUID;
    EXCEPTION
      WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Cadastro de vistoriador exige canal seguro.'
          USING ERRCODE = '22023';
    END;

    IF v_intent_id IS NULL THEN
      RAISE EXCEPTION 'Cadastro de vistoriador exige canal seguro.'
        USING ERRCODE = '22023';
    END IF;

    DELETE FROM private.inspector_signup_intents
    WHERE id = v_intent_id
    RETURNING document_hash, document_tail, document_type
    INTO v_document_hash, v_document_tail, v_document_type;

    IF v_document_hash IS NULL THEN
      RAISE EXCEPTION 'Cadastro de vistoriador exige canal seguro.'
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
      v_document_hash,
      v_document_tail,
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
