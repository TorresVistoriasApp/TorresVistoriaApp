-- Vistoriador pode manter CPF/CNPJ, razão social, nome fantasia e endereço
-- exibidos no laudo em PDF. Demais campos da empresa continuam só com super admin.

INSERT INTO public.permissions (code, name, description) VALUES
  (
    'settings.company.identity',
    'Dados cadastrais do laudo',
    'Alterar CPF/CNPJ, identificação e endereço impressos no laudo em PDF'
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code = 'settings.company.identity'
WHERE r.code IN ('SUPER_ADMIN', 'INSPECTOR')
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE POLICY companies_update_inspector_identity ON public.companies FOR UPDATE
  USING (
    id = public.get_user_tenant_id()
    AND public.is_inspector()
    AND deleted_at IS NULL
  )
  WITH CHECK (
    id = public.get_user_tenant_id()
    AND public.is_inspector()
  );

CREATE OR REPLACE FUNCTION public.enforce_inspector_company_update_scope()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_super_admin() OR NOT public.is_inspector() THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
    OR NEW.created_by IS DISTINCT FROM OLD.created_by
    OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
    OR NEW.deleted_by IS DISTINCT FROM OLD.deleted_by
    OR NEW.email IS DISTINCT FROM OLD.email
    OR NEW.phone IS DISTINCT FROM OLD.phone
    OR NEW.logo_url IS DISTINCT FROM OLD.logo_url
    OR NEW.primary_color IS DISTINCT FROM OLD.primary_color
    OR NEW.secondary_color IS DISTINCT FROM OLD.secondary_color
    OR NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan
    OR NEW.status IS DISTINCT FROM OLD.status
    OR NEW.feature_flags IS DISTINCT FROM OLD.feature_flags
  THEN
    RAISE EXCEPTION 'Vistoriadores só podem alterar identificação e endereço cadastral do laudo.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_inspector_company_update_scope ON public.companies;
CREATE TRIGGER trg_enforce_inspector_company_update_scope
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_inspector_company_update_scope();
