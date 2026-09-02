-- Fecha a janela em que o JWT de signup/login era mintado com CPF/CNPJ em
-- user_metadata. O GoTrue assina o access token a partir do INSERT/UPDATE
-- RETURNING; o strip no AFTER INSERT não altera esse retorno nem revoga o JWT.
--
-- BEFORE INSERT/UPDATE remove `document` de NEW.raw_user_meta_data (o que o
-- Auth persiste e devolve). Os dígitos ficam só em GUC de transação para o
-- handle_new_user gravar o HMAC em inspector_registrations.

CREATE OR REPLACE FUNCTION public.stash_and_strip_auth_document()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_temp
AS $$
DECLARE
  v_digits TEXT;
BEGIN
  v_digits := regexp_replace(COALESCE(NEW.raw_user_meta_data->>'document', ''), '\D', '', 'g');

  IF TG_OP = 'INSERT' AND v_digits <> '' THEN
    PERFORM set_config('torres.signup_document', v_digits, true);
  END IF;

  IF COALESCE(NEW.raw_user_meta_data, '{}'::jsonb) ? 'document' THEN
    NEW.raw_user_meta_data := NEW.raw_user_meta_data - 'document';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.stash_and_strip_auth_document() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_auth_users_stash_strip_document ON auth.users;
CREATE TRIGGER trg_auth_users_stash_strip_document
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.stash_and_strip_auth_document();

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
    v_document_digits := regexp_replace(
      COALESCE(
        NEW.raw_user_meta_data->>'document',
        NULLIF(current_setting('torres.signup_document', true), ''),
        ''
      ),
      '\D',
      '',
      'g'
    );

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
