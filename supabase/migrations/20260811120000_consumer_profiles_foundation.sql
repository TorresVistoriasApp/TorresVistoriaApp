-- Etapa 1 — Fundação B2C: consumer_profiles, handle_new_user e RLS inicial.
--
-- Separa identidades CUSTOMER (Torres Consulta) de TENANT_MEMBER (Torres Vistoria)
-- sem alterar o fluxo existente de profiles/platform_admins.

-- ---------------------------------------------------------------------------
-- 1. Tabela consumer_profiles (1:1 com auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE public.consumer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  account_status TEXT NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'pending_deletion', 'deleted')),
  deletion_requested_at TIMESTAMPTZ,
  deletion_scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_consumer_profiles_email
  ON public.consumer_profiles (email)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_consumer_profiles_updated_at ON public.consumer_profiles;
CREATE TRIGGER trg_consumer_profiles_updated_at
  BEFORE UPDATE ON public.consumer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Helpers de identidade
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_consumer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.consumer_profiles
    WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND account_status <> 'deleted'
  );
$$;

REVOKE ALL ON FUNCTION public.is_consumer() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_consumer() TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. RLS — isolamento por auth.uid()
-- ---------------------------------------------------------------------------

ALTER TABLE public.consumer_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: somente o próprio registro ativo.
CREATE POLICY consumer_profiles_select_self ON public.consumer_profiles
  FOR SELECT
  USING (
    id = auth.uid()
    AND deleted_at IS NULL
  );

-- UPDATE: somente o próprio registro; colunas sensíveis protegidas por trigger.
CREATE POLICY consumer_profiles_update_self ON public.consumer_profiles
  FOR UPDATE
  USING (
    id = auth.uid()
    AND deleted_at IS NULL
  )
  WITH CHECK (
    id = auth.uid()
    AND deleted_at IS NULL
  );

-- INSERT deliberadamente sem policy para authenticated: criação só via trigger
-- handle_new_user (SECURITY DEFINER), evitando INSERT arbitrário pelo client.

-- ---------------------------------------------------------------------------
-- 4. Trigger anti-escalonamento (status de conta / exclusão)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.prevent_consumer_profile_self_escalation()
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

  IF NEW.account_status IS DISTINCT FROM OLD.account_status
     OR NEW.deletion_requested_at IS DISTINCT FROM OLD.deletion_requested_at
     OR NEW.deletion_scheduled_at IS DISTINCT FROM OLD.deletion_scheduled_at
     OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
  THEN
    RAISE EXCEPTION 'Status de conta e exclusão só podem ser alterados pelo sistema.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_consumer_profile_self_escalation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS consumer_profiles_prevent_self_escalation ON public.consumer_profiles;
CREATE TRIGGER consumer_profiles_prevent_self_escalation
  BEFORE UPDATE ON public.consumer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_consumer_profile_self_escalation();

-- ---------------------------------------------------------------------------
-- 5. handle_new_user — reconhece consumer, platform admin e tenant member
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

  v_tenant_id := COALESCE(
    NEW.raw_app_meta_data->>'tenant_id',
    NEW.raw_app_meta_data->>'company_id'
  )::UUID;
  v_role := public.normalize_tenant_role(NEW.raw_app_meta_data->>'role');
  v_must_change_password := COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false);

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Cadastro exige tenant_id explícito no metadata do usuário ou user_type consumer.';
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
