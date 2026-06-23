-- Torres Vistoria: RLS, triggers, indexes

CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inspections_company_id ON public.inspections(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inspections_inspector_id ON public.inspections(inspector_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inspections_plate ON public.inspections(plate) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inspections_date ON public.inspections(inspection_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inspections_status ON public.inspections(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_financial_company_date ON public.financial_entries(company_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_created ON public.audit_logs(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read_at);

CREATE OR REPLACE FUNCTION public.assign_inspection_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.inspection_number IS NULL OR NEW.inspection_number = 0 THEN
    SELECT COALESCE(MAX(inspection_number), 0) + 1 INTO NEW.inspection_number
    FROM public.inspections WHERE company_id = NEW.company_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_inspections_number ON public.inspections;
CREATE TRIGGER trg_inspections_number BEFORE INSERT ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION public.assign_inspection_number();

CREATE OR REPLACE FUNCTION public.audit_log_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_logs (company_id, user_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (
    COALESCE(NEW.company_id, OLD.company_id, public.get_user_company_id()),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_company_id UUID;
  v_role TEXT;
BEGIN
  v_company_id := (NEW.raw_app_meta_data->>'company_id')::UUID;
  v_role := COALESCE(NEW.raw_app_meta_data->>'role', 'VISTORIADOR');
  IF v_company_id IS NULL THEN
    SELECT id INTO v_company_id FROM public.companies WHERE deleted_at IS NULL ORDER BY created_at LIMIT 1;
  END IF;
  INSERT INTO public.profiles (id, company_id, full_name, role)
  VALUES (NEW.id, v_company_id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), v_role);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['companies','roles','permissions','role_permissions','profiles','settings','inspections','inspection_checklists','inspection_photos','inspection_comments','inspection_reports','financial_entries','audit_logs','notifications']
  LOOP EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- Companies
DROP POLICY IF EXISTS companies_select ON public.companies;
CREATE POLICY companies_select ON public.companies FOR SELECT
  USING (id = public.get_user_company_id() AND deleted_at IS NULL);
DROP POLICY IF EXISTS companies_update ON public.companies;
CREATE POLICY companies_update ON public.companies FOR UPDATE
  USING (id = public.get_user_company_id() AND public.is_super_admin());

-- Profiles
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles FOR SELECT
  USING (company_id = public.get_user_company_id() AND deleted_at IS NULL);
DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS profiles_admin ON public.profiles;
CREATE POLICY profiles_admin ON public.profiles FOR ALL
  USING (company_id = public.get_user_company_id() AND public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() AND public.is_super_admin());

-- Settings
DROP POLICY IF EXISTS settings_tenant ON public.settings;
CREATE POLICY settings_tenant ON public.settings FOR ALL
  USING (company_id = public.get_user_company_id() AND deleted_at IS NULL)
  WITH CHECK (company_id = public.get_user_company_id());

-- Inspections
DROP POLICY IF EXISTS inspections_select ON public.inspections;
CREATE POLICY inspections_select ON public.inspections FOR SELECT
  USING (company_id = public.get_user_company_id() AND deleted_at IS NULL
    AND (public.is_super_admin() OR inspector_id = auth.uid()));
DROP POLICY IF EXISTS inspections_insert ON public.inspections;
CREATE POLICY inspections_insert ON public.inspections FOR INSERT
  WITH CHECK (company_id = public.get_user_company_id() AND inspector_id = auth.uid());
DROP POLICY IF EXISTS inspections_update ON public.inspections;
CREATE POLICY inspections_update ON public.inspections FOR UPDATE
  USING (company_id = public.get_user_company_id() AND deleted_at IS NULL
    AND (public.is_super_admin() OR inspector_id = auth.uid()));

-- Child tables
DROP POLICY IF EXISTS checklists_tenant ON public.inspection_checklists;
CREATE POLICY checklists_tenant ON public.inspection_checklists FOR ALL
  USING (company_id = public.get_user_company_id() AND deleted_at IS NULL)
  WITH CHECK (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS photos_tenant ON public.inspection_photos;
CREATE POLICY photos_tenant ON public.inspection_photos FOR ALL
  USING (company_id = public.get_user_company_id() AND deleted_at IS NULL)
  WITH CHECK (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS comments_admin ON public.inspection_comments;
CREATE POLICY comments_admin ON public.inspection_comments FOR ALL
  USING (company_id = public.get_user_company_id() AND public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() AND public.is_super_admin());

DROP POLICY IF EXISTS reports_tenant ON public.inspection_reports;
CREATE POLICY reports_tenant ON public.inspection_reports FOR ALL
  USING (company_id = public.get_user_company_id() AND deleted_at IS NULL)
  WITH CHECK (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS financial_admin ON public.financial_entries;
CREATE POLICY financial_admin ON public.financial_entries FOR ALL
  USING (company_id = public.get_user_company_id() AND public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() AND public.is_super_admin());

DROP POLICY IF EXISTS audit_read ON public.audit_logs;
CREATE POLICY audit_read ON public.audit_logs FOR SELECT
  USING (company_id = public.get_user_company_id() AND public.is_super_admin());

DROP POLICY IF EXISTS notifications_own ON public.notifications;
CREATE POLICY notifications_own ON public.notifications FOR ALL
  USING (user_id = auth.uid() AND deleted_at IS NULL) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS roles_read ON public.roles;
CREATE POLICY roles_read ON public.roles FOR SELECT TO authenticated USING (deleted_at IS NULL);
DROP POLICY IF EXISTS permissions_read ON public.permissions;
CREATE POLICY permissions_read ON public.permissions FOR SELECT TO authenticated USING (deleted_at IS NULL);
DROP POLICY IF EXISTS role_permissions_read ON public.role_permissions;
CREATE POLICY role_permissions_read ON public.role_permissions FOR SELECT TO authenticated USING (deleted_at IS NULL);

DROP TRIGGER IF EXISTS trg_audit_inspections ON public.inspections;
CREATE TRIGGER trg_audit_inspections AFTER INSERT OR UPDATE OR DELETE ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

DROP TRIGGER IF EXISTS trg_audit_financial ON public.financial_entries;
CREATE TRIGGER trg_audit_financial AFTER INSERT OR UPDATE OR DELETE ON public.financial_entries
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();
