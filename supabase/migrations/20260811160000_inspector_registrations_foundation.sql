-- Etapa 5 — Cadastro público de vistoriador com aprovação administrativa.

-- ---------------------------------------------------------------------------
-- 1. Registros pendentes (staging antes de profiles)
-- ---------------------------------------------------------------------------

CREATE TABLE public.inspector_registrations (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  document_type TEXT NOT NULL CHECK (document_type IN ('cpf', 'cnpj')),
  document_hash TEXT NOT NULL,
  document_tail TEXT NOT NULL CHECK (length(document_tail) = 4),
  status TEXT NOT NULL DEFAULT 'pending_approval'
    CHECK (status IN ('pending_approval', 'approved', 'rejected')),
  rejection_reason TEXT,
  approved_tenant_id UUID REFERENCES public.companies(id),
  approved_role public.tenant_role,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inspector_registrations_document_hash_active
  ON public.inspector_registrations (document_hash)
  WHERE status = 'pending_approval';

CREATE INDEX IF NOT EXISTS idx_inspector_registrations_status_created
  ON public.inspector_registrations (status, created_at DESC);

DROP TRIGGER IF EXISTS trg_inspector_registrations_updated_at ON public.inspector_registrations;
CREATE TRIGGER trg_inspector_registrations_updated_at
  BEFORE UPDATE ON public.inspector_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_pending_inspector()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.inspector_registrations
    WHERE id = auth.uid()
      AND status = 'pending_approval'
  );
$$;

REVOKE ALL ON FUNCTION public.is_pending_inspector() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_pending_inspector() TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.inspector_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY inspector_registrations_select_self ON public.inspector_registrations
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY inspector_registrations_select_platform ON public.inspector_registrations
  FOR SELECT
  USING (public.is_platform_admin());

-- INSERT/UPDATE apenas via trigger handle_new_user e edge functions (service role).

-- ---------------------------------------------------------------------------
-- 4. handle_new_user — ramo inspector (self-signup B2B)
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
      encode(digest(v_document_digits, 'sha256'), 'hex'),
      right(v_document_digits, 4),
      'pending_approval'
    );
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

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
