-- Fase G hardening: created_by do JWT, pending/ morto, mapa legado só service_role.

-- ---------------------------------------------------------------------------
-- G1 — created_by do cliente autenticado não é mais aceito
-- service_role (auth.uid() IS NULL) continua podendo gravar o dono real.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.stamp_row_audit_user_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF auth.uid() IS NOT NULL THEN
      NEW.created_by := auth.uid();
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF auth.uid() IS NOT NULL THEN
      NEW.updated_by := auth.uid();
      IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
        RAISE EXCEPTION 'created_by não pode ser alterado.';
      END IF;
    END IF;

    IF OLD.deleted_at IS NULL
       AND NEW.deleted_at IS NOT NULL
       AND NEW.deleted_by IS NULL
       AND auth.uid() IS NOT NULL
    THEN
      NEW.deleted_by := auth.uid();
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.stamp_row_audit_user_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_inspection_orders_stamp_audit_users ON public.inspection_orders;
CREATE TRIGGER trg_inspection_orders_stamp_audit_users
  BEFORE INSERT OR UPDATE ON public.inspection_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.stamp_row_audit_user_fields();

-- ---------------------------------------------------------------------------
-- G2 — pending/ deixa de ser path canônico. Arquivos antigos não são apagados.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_canonical_report_object_path(p_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_name IS NOT NULL
    AND p_name ~ '\.pdf$'
    AND p_name NOT LIKE 'pending/%'
    AND (storage.foldername(p_name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND (storage.foldername(p_name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND array_length(storage.foldername(p_name), 1) = 2;
$$;

CREATE OR REPLACE FUNCTION public.validate_inspection_report_storage_path()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.storage_path IS NULL OR btrim(NEW.storage_path) = '' THEN
    RAISE EXCEPTION 'inspection_reports.storage_path é obrigatório';
  END IF;

  IF NEW.storage_path LIKE 'pending/%' THEN
    RAISE EXCEPTION 'laudos pending/ não são mais aceitos';
  END IF;

  IF split_part(NEW.storage_path, '/', 1) <> NEW.tenant_id::text THEN
    RAISE EXCEPTION 'storage_path do laudo deve iniciar com tenant_id da linha';
  END IF;

  IF split_part(NEW.storage_path, '/', 2) <> NEW.inspection_id::text THEN
    RAISE EXCEPTION 'storage_path do laudo deve conter inspection_id da linha';
  END IF;

  IF NEW.storage_path !~ '\.pdf$' THEN
    RAISE EXCEPTION 'laudos devem usar extensão .pdf';
  END IF;

  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS storage_reports_select ON storage.objects;
CREATE POLICY storage_reports_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'reports'
    AND public.is_canonical_report_object_path(name)
    AND (storage.foldername(name))[1] = public.get_user_tenant_id()::text
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspection_reports r
        WHERE r.storage_path = storage.objects.name
          AND r.tenant_id = public.get_user_tenant_id()
          AND r.deleted_at IS NULL
          AND r.created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS storage_reports_insert ON storage.objects;
DROP POLICY IF EXISTS storage_reports_update ON storage.objects;
DROP POLICY IF EXISTS reports_insert ON public.inspection_reports;
DROP POLICY IF EXISTS reports_update ON public.inspection_reports;
DROP POLICY IF EXISTS reports_delete ON public.inspection_reports;

-- Mapa de migração: só service_role (script Node). SUPER_ADMIN JWT não lê paths de outros tenants.
DROP POLICY IF EXISTS legacy_storage_path_map_admin ON public.legacy_storage_path_map;
REVOKE ALL ON TABLE public.legacy_storage_path_map FROM PUBLIC, anon, authenticated;
