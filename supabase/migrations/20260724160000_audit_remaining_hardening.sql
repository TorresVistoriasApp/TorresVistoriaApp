-- Fecha o restante da auditoria: buckets, RLS filhas, is_active, photo config,
-- handle_new_user fail-closed e redação de PII no audit log.

-- 1. Buckets restantes privados
UPDATE storage.buckets
SET public = false
WHERE id IN ('avatars', 'company-assets');

DROP POLICY IF EXISTS storage_avatars_select ON storage.objects;
CREATE POLICY storage_avatars_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_super_admin()
    )
  );

-- 2. Helpers de tenant respeitam is_active
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM public.profiles
  WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::TEXT
  FROM public.profiles
  WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND is_active = true
  LIMIT 1;
$$;

-- 3. RLS das tabelas filhas: escopo do vistoriador (igual inspections_select)
CREATE OR REPLACE FUNCTION public.can_access_inspection_row(p_inspection_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.inspections i
    WHERE i.id = p_inspection_id
      AND i.deleted_at IS NULL
      AND i.company_id = public.get_user_company_id()
      AND (public.is_super_admin() OR i.inspector_id = auth.uid())
  );
$$;

REVOKE ALL ON FUNCTION public.can_access_inspection_row(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_inspection_row(UUID) TO authenticated;

DROP POLICY IF EXISTS checklists_tenant ON public.inspection_checklists;
CREATE POLICY checklists_select ON public.inspection_checklists FOR SELECT
  USING (deleted_at IS NULL AND public.can_access_inspection_row(inspection_id));
CREATE POLICY checklists_insert ON public.inspection_checklists FOR INSERT
  WITH CHECK (company_id = public.get_user_company_id() AND public.can_access_inspection_row(inspection_id));
CREATE POLICY checklists_update ON public.inspection_checklists FOR UPDATE
  USING (deleted_at IS NULL AND public.can_access_inspection_row(inspection_id))
  WITH CHECK (company_id = public.get_user_company_id() AND public.can_access_inspection_row(inspection_id));
CREATE POLICY checklists_delete ON public.inspection_checklists FOR DELETE
  USING (public.can_access_inspection_row(inspection_id));

DROP POLICY IF EXISTS photos_tenant ON public.inspection_photos;
CREATE POLICY photos_select ON public.inspection_photos FOR SELECT
  USING (deleted_at IS NULL AND public.can_access_inspection_row(inspection_id));
CREATE POLICY photos_insert ON public.inspection_photos FOR INSERT
  WITH CHECK (company_id = public.get_user_company_id() AND public.can_access_inspection_row(inspection_id));
CREATE POLICY photos_update ON public.inspection_photos FOR UPDATE
  USING (deleted_at IS NULL AND public.can_access_inspection_row(inspection_id))
  WITH CHECK (company_id = public.get_user_company_id() AND public.can_access_inspection_row(inspection_id));
CREATE POLICY photos_delete ON public.inspection_photos FOR DELETE
  USING (public.can_access_inspection_row(inspection_id));

DROP POLICY IF EXISTS reports_tenant ON public.inspection_reports;
CREATE POLICY reports_select ON public.inspection_reports FOR SELECT
  USING (deleted_at IS NULL AND public.can_access_inspection_row(inspection_id));
CREATE POLICY reports_insert ON public.inspection_reports FOR INSERT
  WITH CHECK (company_id = public.get_user_company_id() AND public.can_access_inspection_row(inspection_id));
CREATE POLICY reports_update ON public.inspection_reports FOR UPDATE
  USING (deleted_at IS NULL AND public.can_access_inspection_row(inspection_id))
  WITH CHECK (company_id = public.get_user_company_id() AND public.can_access_inspection_row(inspection_id));
CREATE POLICY reports_delete ON public.inspection_reports FOR DELETE
  USING (public.can_access_inspection_row(inspection_id));

DROP POLICY IF EXISTS paint_items_tenant ON public.inspection_paint_items;
CREATE POLICY paint_items_select ON public.inspection_paint_items FOR SELECT
  USING (deleted_at IS NULL AND public.can_access_inspection_row(inspection_id));
CREATE POLICY paint_items_insert ON public.inspection_paint_items FOR INSERT
  WITH CHECK (company_id = public.get_user_company_id() AND public.can_access_inspection_row(inspection_id));
CREATE POLICY paint_items_update ON public.inspection_paint_items FOR UPDATE
  USING (deleted_at IS NULL AND public.can_access_inspection_row(inspection_id))
  WITH CHECK (company_id = public.get_user_company_id() AND public.can_access_inspection_row(inspection_id));
CREATE POLICY paint_items_delete ON public.inspection_paint_items FOR DELETE
  USING (public.can_access_inspection_row(inspection_id));

-- 4. photo_sections / photo_categories: leitura tenant, escrita só admin
DROP POLICY IF EXISTS photo_sections_tenant ON public.photo_sections;
CREATE POLICY photo_sections_select ON public.photo_sections FOR SELECT
  USING (
    deleted_at IS NULL
    AND (company_id IS NULL OR company_id = public.get_user_company_id())
  );
CREATE POLICY photo_sections_admin_write ON public.photo_sections FOR ALL
  USING (public.is_super_admin() AND (company_id IS NULL OR company_id = public.get_user_company_id()))
  WITH CHECK (public.is_super_admin() AND (company_id IS NULL OR company_id = public.get_user_company_id()));

DROP POLICY IF EXISTS photo_categories_tenant ON public.photo_categories;
CREATE POLICY photo_categories_select ON public.photo_categories FOR SELECT
  USING (
    deleted_at IS NULL
    AND (company_id IS NULL OR company_id = public.get_user_company_id())
  );
CREATE POLICY photo_categories_admin_write ON public.photo_categories FOR ALL
  USING (public.is_super_admin() AND (company_id IS NULL OR company_id = public.get_user_company_id()))
  WITH CHECK (public.is_super_admin() AND (company_id IS NULL OR company_id = public.get_user_company_id()));

-- 5. handle_new_user: exige company_id explícito
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

-- 6. Audit log: redige campos sensíveis
CREATE OR REPLACE FUNCTION public.redact_audit_jsonb(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  result JSONB := payload;
  key TEXT;
  sensitive TEXT[] := ARRAY[
    'client_document', 'client_phone', 'client_email', 'client_name',
    'chassis', 'renavam', 'plate', 'email', 'phone', 'document',
    'latitude', 'longitude', 'gps_accuracy', 'exif_metadata',
    'internal_notes', 'password', 'recovery_token'
  ];
BEGIN
  IF result IS NULL OR jsonb_typeof(result) <> 'object' THEN
    RETURN result;
  END IF;

  FOREACH key IN ARRAY sensitive LOOP
    IF result ? key THEN
      result := jsonb_set(result, ARRAY[key], to_jsonb('[redacted]'::text), true);
    END IF;
  END LOOP;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_log_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'companies' THEN
    v_company_id := COALESCE(NEW.id, OLD.id);
  ELSE
    v_company_id := COALESCE(NEW.company_id, OLD.company_id, public.get_user_company_id());
  END IF;

  INSERT INTO public.audit_logs (company_id, user_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (
    v_company_id,
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN public.redact_audit_jsonb(to_jsonb(OLD)) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN public.redact_audit_jsonb(to_jsonb(NEW)) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;
