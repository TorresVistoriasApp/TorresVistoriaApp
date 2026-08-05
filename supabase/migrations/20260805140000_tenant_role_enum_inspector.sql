-- ETAPA 3 — PERFIS (Role enum)
--
-- Renomeia VISTORIADOR → INSPECTOR em todo o sistema e introduz o enum
-- PostgreSQL `tenant_role` com papéis futuros reservados (sem permissões ainda).

-- 1. Remove CHECKs legados que só permitiam SUPER_ADMIN | VISTORIADOR
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS roles_code_check;

-- 2. Backfill de dados (sem perda)
UPDATE public.profiles
SET role = 'INSPECTOR'
WHERE role = 'VISTORIADOR';

UPDATE public.roles
SET
  code = 'INSPECTOR',
  name = 'Vistoriador',
  description = 'Cria e edita próprias vistorias'
WHERE code = 'VISTORIADOR';

UPDATE auth.users
SET raw_app_meta_data = jsonb_set(raw_app_meta_data, '{role}', '"INSPECTOR"'::jsonb)
WHERE raw_app_meta_data->>'role' = 'VISTORIADOR';

-- 3. Enum canônico de papéis do tenant
DO $$
BEGIN
  CREATE TYPE public.tenant_role AS ENUM (
    'SUPER_ADMIN',
    'INSPECTOR',
    'FINANCIAL',
    'MANAGER',
    'READ_ONLY',
    'SUPPORT',
    'OWNER'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

COMMENT ON TYPE public.tenant_role IS
  'Papéis de usuário dentro de um tenant. SUPER_ADMIN e INSPECTOR estão ativos; os demais são reservados para expansão futura do RBAC.';

-- 4. Converte colunas TEXT → tenant_role
ALTER TABLE public.profiles
  ALTER COLUMN role DROP DEFAULT;

ALTER TABLE public.profiles
  ALTER COLUMN role TYPE public.tenant_role
  USING role::public.tenant_role;

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'INSPECTOR'::public.tenant_role;

ALTER TABLE public.roles
  ALTER COLUMN code TYPE public.tenant_role
  USING code::public.tenant_role;

-- 5. Catálogo de papéis futuros (sem role_permissions — só preparação)
INSERT INTO public.roles (code, name, description) VALUES
  ('FINANCIAL', 'Financeiro', 'Reservado — gestão financeira (implementação futura)'),
  ('MANAGER', 'Gestor', 'Reservado — gestão operacional (implementação futura)'),
  ('READ_ONLY', 'Somente leitura', 'Reservado — acesso somente leitura (implementação futura)'),
  ('SUPPORT', 'Suporte', 'Reservado — suporte interno (implementação futura)'),
  ('OWNER', 'Proprietário', 'Reservado — titular da conta SaaS (implementação futura)')
ON CONFLICT (code) DO NOTHING;

-- 6. Normalização de papel (aceita legado VISTORIADOR em metadata)
CREATE OR REPLACE FUNCTION public.normalize_tenant_role(p_role TEXT)
RETURNS public.tenant_role
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_role IS NULL OR btrim(p_role) = '' THEN
    RETURN 'INSPECTOR'::public.tenant_role;
  END IF;

  IF p_role = 'VISTORIADOR' THEN
    RETURN 'INSPECTOR'::public.tenant_role;
  END IF;

  RETURN p_role::public.tenant_role;
EXCEPTION
  WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'Papel inválido: %', p_role;
END;
$$;

REVOKE ALL ON FUNCTION public.normalize_tenant_role(TEXT) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.is_inspector()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.get_user_role() = 'INSPECTOR', FALSE);
$$;

REVOKE ALL ON FUNCTION public.is_inspector() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_inspector() TO authenticated;

CREATE OR REPLACE FUNCTION public.dashboard_inspector_scope()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.is_super_admin() THEN NULL::UUID
    WHEN public.is_inspector() THEN auth.uid()
    ELSE NULL::UUID
  END;
$$;

-- 7. handle_new_user: default INSPECTOR + normalização de legado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_role public.tenant_role;
  v_must_change_password BOOLEAN;
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

  v_company_id := (NEW.raw_app_meta_data->>'company_id')::UUID;
  v_role := public.normalize_tenant_role(NEW.raw_app_meta_data->>'role');
  v_must_change_password := COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false);

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Cadastro exige company_id explícito no metadata do usuário.';
  END IF;

  INSERT INTO public.profiles (
    id, company_id, full_name, role, email, must_change_password, is_active
  )
  VALUES (
    NEW.id,
    v_company_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    v_role,
    NEW.email,
    v_must_change_password,
    true
  );

  RETURN NEW;
END;
$$;
