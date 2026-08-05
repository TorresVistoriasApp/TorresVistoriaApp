-- ETAPA 6 — STORAGE (paths canônicos multi-tenant)
--
-- Layout obrigatório para fotos:
--   {company_id}/{inspection_id}/{photo_category}/{arquivo}.webp
--   {company_id}/{inspection_id}/{photo_category}/thumbs/{arquivo}.webp
--
-- Layout obrigatório para laudos (bucket reports):
--   {company_id}/{inspection_id}/{arquivo}.pdf
--
-- Garante isolamento por empresa no path e valida consistência com as colunas do banco.

-- ---------------------------------------------------------------------------
-- 1. Helpers de path (fotos)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.inspection_photo_thumbnail_path(p_storage_path TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_storage_path IS NULL OR btrim(p_storage_path) = '' THEN NULL
    WHEN p_storage_path ~ '/thumbs/[^/]+$' THEN p_storage_path
    ELSE regexp_replace(p_storage_path, '/([^/]+)$', '/thumbs/\1')
  END;
$$;

CREATE OR REPLACE FUNCTION public.inspection_photo_matches_storage_object(
  p_storage_path TEXT,
  p_thumbnail_url TEXT,
  p_object_name TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_object_name IS NOT NULL
    AND p_object_name IN (
      p_storage_path,
      NULLIF(btrim(p_thumbnail_url), ''),
      public.inspection_photo_thumbnail_path(p_storage_path)
    );
$$;

CREATE OR REPLACE FUNCTION public.inspection_photo_object_category(p_name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN (storage.foldername(p_name))[4] = 'thumbs'
      THEN (storage.foldername(p_name))[3]
    ELSE (storage.foldername(p_name))[3]
  END;
$$;

CREATE OR REPLACE FUNCTION public.is_canonical_inspection_photo_object_path(p_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_name IS NOT NULL
    AND p_name ~ '\.webp$'
    AND (storage.foldername(p_name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND (storage.foldername(p_name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND (
      (
        array_length(storage.foldername(p_name), 1) = 3
        AND (storage.foldername(p_name))[3] <> ''
      )
      OR (
        array_length(storage.foldername(p_name), 1) = 4
        AND (storage.foldername(p_name))[4] = 'thumbs'
        AND (storage.foldername(p_name))[3] <> ''
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.is_canonical_report_object_path(p_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_name IS NOT NULL
    AND (
      p_name LIKE 'pending/%'
      OR (
        p_name ~ '\.pdf$'
        AND (storage.foldername(p_name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        AND (storage.foldername(p_name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        AND array_length(storage.foldername(p_name), 1) = 2
      )
    );
$$;

-- ---------------------------------------------------------------------------
-- 2. Validação em inspection_photos (consistência path ↔ colunas)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_inspection_photo_storage_path()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.storage_path IS NULL OR btrim(NEW.storage_path) = '' THEN
    RAISE EXCEPTION 'inspection_photos.storage_path é obrigatório';
  END IF;

  IF split_part(NEW.storage_path, '/', 1) <> NEW.company_id::text THEN
    RAISE EXCEPTION 'storage_path deve iniciar com company_id da linha';
  END IF;

  IF split_part(NEW.storage_path, '/', 2) <> NEW.inspection_id::text THEN
    RAISE EXCEPTION 'storage_path deve conter inspection_id da linha';
  END IF;

  IF split_part(NEW.storage_path, '/', 3) <> NEW.category THEN
    RAISE EXCEPTION 'storage_path deve conter category da linha';
  END IF;

  IF NEW.storage_path !~ '\.webp$' THEN
    RAISE EXCEPTION 'fotos de vistoria devem usar extensão .webp';
  END IF;

  IF NEW.thumbnail_url IS NOT NULL
     AND btrim(NEW.thumbnail_url) <> ''
     AND NEW.thumbnail_url <> public.inspection_photo_thumbnail_path(NEW.storage_path) THEN
    RAISE EXCEPTION 'thumbnail_url deve seguir o padrão .../thumbs/arquivo.webp';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_inspection_photo_storage_path ON public.inspection_photos;
CREATE TRIGGER trg_validate_inspection_photo_storage_path
  BEFORE INSERT OR UPDATE OF storage_path, thumbnail_url, company_id, inspection_id, category
  ON public.inspection_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_inspection_photo_storage_path();

-- ---------------------------------------------------------------------------
-- 3. Validação em inspection_reports
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_inspection_report_storage_path()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.storage_path IS NULL OR btrim(NEW.storage_path) = '' THEN
    RAISE EXCEPTION 'inspection_reports.storage_path é obrigatório';
  END IF;

  IF NEW.storage_path LIKE 'pending/%' THEN
    RETURN NEW;
  END IF;

  IF split_part(NEW.storage_path, '/', 1) <> NEW.company_id::text THEN
    RAISE EXCEPTION 'storage_path do laudo deve iniciar com company_id da linha';
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

DROP TRIGGER IF EXISTS trg_validate_inspection_report_storage_path ON public.inspection_reports;
CREATE TRIGGER trg_validate_inspection_report_storage_path
  BEFORE INSERT OR UPDATE OF storage_path, company_id, inspection_id
  ON public.inspection_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_inspection_report_storage_path();

-- ---------------------------------------------------------------------------
-- 4. Storage inspection-photos — path canônico + escopo por created_by
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS storage_photos_select ON storage.objects;
CREATE POLICY storage_photos_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'inspection-photos'
    AND public.is_canonical_inspection_photo_object_path(name)
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspection_photos p
        WHERE p.company_id = public.get_user_company_id()
          AND p.deleted_at IS NULL
          AND p.created_by = auth.uid()
          AND public.inspection_photo_matches_storage_object(
            p.storage_path,
            p.thumbnail_url,
            storage.objects.name
          )
      )
    )
  );

DROP POLICY IF EXISTS storage_photos_insert ON storage.objects;
CREATE POLICY storage_photos_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'inspection-photos'
    AND public.is_canonical_inspection_photo_object_path(name)
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspections i
        WHERE i.id::text = (storage.foldername(name))[2]
          AND i.company_id = public.get_user_company_id()
          AND i.deleted_at IS NULL
          AND public.can_access_tenant_row(i.company_id, i.created_by)
      )
    )
  );

DROP POLICY IF EXISTS storage_photos_update ON storage.objects;
CREATE POLICY storage_photos_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'inspection-photos'
    AND public.is_canonical_inspection_photo_object_path(name)
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspection_photos p
        WHERE p.company_id = public.get_user_company_id()
          AND p.deleted_at IS NULL
          AND p.created_by = auth.uid()
          AND public.inspection_photo_matches_storage_object(
            p.storage_path,
            p.thumbnail_url,
            storage.objects.name
          )
      )
    )
  )
  WITH CHECK (
    bucket_id = 'inspection-photos'
    AND public.is_canonical_inspection_photo_object_path(name)
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
  );

DROP POLICY IF EXISTS storage_photos_delete ON storage.objects;
CREATE POLICY storage_photos_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'inspection-photos'
    AND public.is_canonical_inspection_photo_object_path(name)
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspection_photos p
        WHERE p.company_id = public.get_user_company_id()
          AND p.deleted_at IS NULL
          AND p.created_by = auth.uid()
          AND public.inspection_photo_matches_storage_object(
            p.storage_path,
            p.thumbnail_url,
            storage.objects.name
          )
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Storage reports — path canônico + escopo por created_by do laudo
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS storage_reports_select ON storage.objects;
CREATE POLICY storage_reports_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'reports'
    AND public.is_canonical_report_object_path(name)
    AND (
      name LIKE 'pending/%'
      OR (storage.foldername(name))[1] = public.get_user_company_id()::text
    )
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspection_reports r
        WHERE r.storage_path = storage.objects.name
          AND r.company_id = public.get_user_company_id()
          AND r.deleted_at IS NULL
          AND r.created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS storage_reports_insert ON storage.objects;
CREATE POLICY storage_reports_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'reports'
    AND public.is_canonical_report_object_path(name)
    AND (
      name LIKE 'pending/%'
      OR (
        (storage.foldername(name))[1] = public.get_user_company_id()::text
        AND EXISTS (
          SELECT 1
          FROM public.inspections i
          WHERE i.id::text = (storage.foldername(name))[2]
            AND i.company_id = public.get_user_company_id()
            AND i.deleted_at IS NULL
            AND public.can_access_tenant_row(i.company_id, i.created_by)
        )
      )
    )
  );

DROP POLICY IF EXISTS storage_reports_update ON storage.objects;
CREATE POLICY storage_reports_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'reports'
    AND public.is_canonical_report_object_path(name)
    AND (
      name LIKE 'pending/%'
      OR (storage.foldername(name))[1] = public.get_user_company_id()::text
    )
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspection_reports r
        WHERE r.storage_path = storage.objects.name
          AND r.company_id = public.get_user_company_id()
          AND r.deleted_at IS NULL
          AND r.created_by = auth.uid()
      )
    )
  )
  WITH CHECK (
    bucket_id = 'reports'
    AND public.is_canonical_report_object_path(name)
    AND (
      name LIKE 'pending/%'
      OR (storage.foldername(name))[1] = public.get_user_company_id()::text
    )
  );

DROP POLICY IF EXISTS storage_reports_delete ON storage.objects;
CREATE POLICY storage_reports_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'reports'
    AND public.is_canonical_report_object_path(name)
    AND (
      name LIKE 'pending/%'
      OR (storage.foldername(name))[1] = public.get_user_company_id()::text
    )
    AND public.is_super_admin()
  );
