-- Fundação do Platform Admin: papel fora do isolamento por company_id, usado
-- só para operar o SaaS (cadastrar empresas, planos, status). Deliberadamente
-- NÃO recebe acesso a inspections/financial_entries/profiles de tenants —
-- isso preserva a privacidade dos dados de clientes mesmo para operadores.

CREATE TABLE public.platform_admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS trg_platform_admins_updated_at ON public.platform_admins;
CREATE TRIGGER trg_platform_admins_updated_at
  BEFORE UPDATE ON public.platform_admins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND is_active = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Só o próprio platform admin lê seu registro. Nenhuma escrita via client:
-- a criação/gestão é feita pela edge function onboard-company com o service
-- role (bypassa RLS), evitando qualquer caminho de auto-promoção.
CREATE POLICY platform_admins_select_self ON public.platform_admins FOR SELECT
  USING (id = auth.uid() AND deleted_at IS NULL);

-- Policies aditivas em companies: RLS combina policies da mesma operação com
-- OR, então isso não afeta o acesso já existente do tenant (companies_select/
-- companies_update). Só quem está em platform_admins enxerga/gerencia todas
-- as empresas.
CREATE POLICY companies_platform_all ON public.companies FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- handle_new_user precisa reconhecer o cadastro de um platform admin (sem
-- company_id, sem profiles) e não pode mais falhar com "company_id exige
-- explícito" nesse caso.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_role TEXT;
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
  v_role := COALESCE(NEW.raw_app_meta_data->>'role', 'VISTORIADOR');
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

-- audit_log_changes: platform_admins e companies criadas/editadas por um
-- platform admin não têm um company_id de "chamador" (get_user_company_id()
-- retorna NULL para quem não tem profile). Mantém o log mesmo assim,
-- sem quebrar em NOT NULL — audit_logs.company_id já é nullable.
