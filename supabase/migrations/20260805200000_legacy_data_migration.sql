-- ETAPA 13 — MIGRATION (dados legados → multi-tenant)
--
-- Script idempotente: pode rodar mais de uma vez sem perder dados.
-- Associa registros órfãos à empresa, completa created_by e normaliza paths
-- no banco. Arquivos físicos no Storage são movidos pelo script Node
-- `scripts/migrate-legacy-storage.mjs` usando legacy_storage_path_map.

-- ---------------------------------------------------------------------------
-- 1. Tabela de mapeamento para migração física de Storage
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.legacy_storage_path_map (
  bucket_id TEXT NOT NULL,
  old_path TEXT NOT NULL,
  new_path TEXT NOT NULL,
  entity_table TEXT,
  entity_id UUID,
  migrated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (bucket_id, old_path)
);

COMMENT ON TABLE public.legacy_storage_path_map IS
  'Mapeamento old_path → new_path para migração física de objetos no Supabase Storage (Etapa 13).';

ALTER TABLE public.legacy_storage_path_map ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS legacy_storage_path_map_admin ON public.legacy_storage_path_map;
CREATE POLICY legacy_storage_path_map_admin ON public.legacy_storage_path_map
  FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- 2. Empresa padrão (tenant mais antigo ativo)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_default_tenant_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.companies
  WHERE deleted_at IS NULL
  ORDER BY created_at ASC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_default_tenant_company_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_default_tenant_company_id() TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Backfill de company_id em registros órfãos
-- ---------------------------------------------------------------------------
UPDATE public.audit_logs al
SET company_id = p.company_id
FROM public.profiles p
WHERE al.company_id IS NULL
  AND al.user_id = p.id
  AND p.deleted_at IS NULL;

UPDATE public.audit_logs
SET company_id = public.get_default_tenant_company_id()
WHERE company_id IS NULL
  AND deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- 4. Backfill de created_by (complementa 20260805150000)
-- ---------------------------------------------------------------------------
UPDATE public.inspections
SET created_by = COALESCE(created_by, inspector_id)
WHERE created_by IS NULL;

UPDATE public.financial_entries fe
SET created_by = i.created_by
FROM public.inspections i
WHERE fe.inspection_id = i.id
  AND fe.created_by IS DISTINCT FROM i.created_by
  AND i.created_by IS NOT NULL
  AND fe.source = 'INSPECTION';

UPDATE public.notifications
SET created_by = user_id
WHERE created_by IS NULL;

UPDATE public.notifications n
SET created_by = sub.profile_id
FROM (
  SELECT DISTINCT ON (p.company_id) p.company_id, p.id AS profile_id
  FROM public.profiles p
  WHERE p.deleted_at IS NULL
    AND p.role = 'SUPER_ADMIN'
  ORDER BY p.company_id, p.created_at
) sub
WHERE n.company_id = sub.company_id
  AND n.created_by IS NULL;

-- ---------------------------------------------------------------------------
-- 5. Normalizar storage_path de fotos (somente registros não canônicos)
-- ---------------------------------------------------------------------------
ALTER TABLE public.inspection_photos DISABLE TRIGGER trg_validate_inspection_photo_storage_path;

INSERT INTO public.legacy_storage_path_map (bucket_id, old_path, new_path, entity_table, entity_id)
SELECT
  'inspection-photos',
  p.storage_path,
  p.company_id::text || '/' || p.inspection_id::text || '/' || p.category || '/' ||
    regexp_replace(p.storage_path, '^.*/', ''),
  'inspection_photos',
  p.id
FROM public.inspection_photos p
WHERE p.deleted_at IS NULL
  AND p.storage_path IS NOT NULL
  AND btrim(p.storage_path) <> ''
  AND split_part(p.storage_path, '/', 1) <> p.company_id::text
ON CONFLICT (bucket_id, old_path) DO UPDATE
  SET new_path = EXCLUDED.new_path,
      entity_table = EXCLUDED.entity_table,
      entity_id = EXCLUDED.entity_id;

UPDATE public.inspection_photos p
SET
  storage_path = m.new_path,
  thumbnail_url = CASE
    WHEN p.thumbnail_url IS NOT NULL AND btrim(p.thumbnail_url) <> '' THEN
      p.company_id::text || '/' || p.inspection_id::text || '/' || p.category || '/thumbs/' ||
        regexp_replace(COALESCE(NULLIF(btrim(p.thumbnail_url), ''), p.storage_path), '^.*/', '')
    ELSE NULL
  END
FROM public.legacy_storage_path_map m
WHERE m.bucket_id = 'inspection-photos'
  AND m.entity_table = 'inspection_photos'
  AND m.entity_id = p.id
  AND m.old_path = p.storage_path
  AND p.deleted_at IS NULL;

-- Thumbnails legados com path separado
INSERT INTO public.legacy_storage_path_map (bucket_id, old_path, new_path, entity_table, entity_id)
SELECT
  'inspection-photos',
  p.thumbnail_url,
  public.inspection_photo_thumbnail_path(p.storage_path),
  'inspection_photos',
  p.id
FROM public.inspection_photos p
WHERE p.deleted_at IS NULL
  AND p.thumbnail_url IS NOT NULL
  AND btrim(p.thumbnail_url) <> ''
  AND p.thumbnail_url <> public.inspection_photo_thumbnail_path(p.storage_path)
ON CONFLICT (bucket_id, old_path) DO UPDATE
  SET new_path = EXCLUDED.new_path,
      entity_table = EXCLUDED.entity_table,
      entity_id = EXCLUDED.entity_id;

UPDATE public.inspection_photos p
SET thumbnail_url = public.inspection_photo_thumbnail_path(p.storage_path)
WHERE p.deleted_at IS NULL
  AND p.thumbnail_url IS NOT NULL
  AND btrim(p.thumbnail_url) <> ''
  AND p.thumbnail_url <> public.inspection_photo_thumbnail_path(p.storage_path);

ALTER TABLE public.inspection_photos ENABLE TRIGGER trg_validate_inspection_photo_storage_path;

-- ---------------------------------------------------------------------------
-- 6. Normalizar storage_path de laudos (exceto pending/)
-- ---------------------------------------------------------------------------
ALTER TABLE public.inspection_reports DISABLE TRIGGER trg_validate_inspection_report_storage_path;

INSERT INTO public.legacy_storage_path_map (bucket_id, old_path, new_path, entity_table, entity_id)
SELECT
  'reports',
  r.storage_path,
  r.company_id::text || '/' || r.inspection_id::text || '/' ||
    regexp_replace(r.storage_path, '^.*/', ''),
  'inspection_reports',
  r.id
FROM public.inspection_reports r
WHERE r.deleted_at IS NULL
  AND r.storage_path IS NOT NULL
  AND btrim(r.storage_path) <> ''
  AND r.storage_path NOT LIKE 'pending/%'
  AND split_part(r.storage_path, '/', 1) <> r.company_id::text
ON CONFLICT (bucket_id, old_path) DO UPDATE
  SET new_path = EXCLUDED.new_path,
      entity_table = EXCLUDED.entity_table,
      entity_id = EXCLUDED.entity_id;

UPDATE public.inspection_reports r
SET storage_path = m.new_path
FROM public.legacy_storage_path_map m
WHERE m.bucket_id = 'reports'
  AND m.entity_table = 'inspection_reports'
  AND m.entity_id = r.id
  AND m.old_path = r.storage_path
  AND r.deleted_at IS NULL
  AND r.storage_path NOT LIKE 'pending/%';

ALTER TABLE public.inspection_reports ENABLE TRIGGER trg_validate_inspection_report_storage_path;

-- ---------------------------------------------------------------------------
-- 7. Relatório de saúde pós-migração (somente super admin do tenant)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_migration_health_report(p_company_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_result JSONB;
BEGIN
  v_company_id := COALESCE(p_company_id, public.get_user_company_id());

  IF NOT public.is_super_admin()
     OR (v_company_id IS NOT NULL AND public.get_user_company_id() IS DISTINCT FROM v_company_id)
  THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT jsonb_build_object(
    'companyId', v_company_id,
    'generatedAt', NOW(),
    'orphanAuditLogs', (
      SELECT COUNT(*)::INTEGER FROM public.audit_logs
      WHERE deleted_at IS NULL
        AND company_id IS NULL
        AND (v_company_id IS NULL OR company_id IS NULL)
    ),
    'inspectionsMissingCreatedBy', (
      SELECT COUNT(*)::INTEGER FROM public.inspections
      WHERE deleted_at IS NULL
        AND created_by IS NULL
        AND (v_company_id IS NULL OR company_id = v_company_id)
    ),
    'photosNonCanonicalPath', (
      SELECT COUNT(*)::INTEGER FROM public.inspection_photos p
      WHERE p.deleted_at IS NULL
        AND (v_company_id IS NULL OR p.company_id = v_company_id)
        AND split_part(p.storage_path, '/', 1) <> p.company_id::text
    ),
    'reportsNonCanonicalPath', (
      SELECT COUNT(*)::INTEGER FROM public.inspection_reports r
      WHERE r.deleted_at IS NULL
        AND r.storage_path NOT LIKE 'pending/%'
        AND (v_company_id IS NULL OR r.company_id = v_company_id)
        AND split_part(r.storage_path, '/', 1) <> r.company_id::text
    ),
    'pendingStorageMigrations', (
      SELECT COUNT(*)::INTEGER FROM public.legacy_storage_path_map
      WHERE migrated_at IS NULL
    ),
    'completedStorageMigrations', (
      SELECT COUNT(*)::INTEGER FROM public.legacy_storage_path_map
      WHERE migrated_at IS NOT NULL
    ),
    'profilesWithoutCompany', (
      SELECT COUNT(*)::INTEGER FROM public.profiles
      WHERE deleted_at IS NULL AND company_id IS NULL
    ),
    'isHealthy', (
      SELECT NOT EXISTS (
        SELECT 1 FROM public.inspections i
        WHERE i.deleted_at IS NULL
          AND i.created_by IS NULL
          AND (v_company_id IS NULL OR i.company_id = v_company_id)
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.inspection_photos p
        WHERE p.deleted_at IS NULL
          AND (v_company_id IS NULL OR p.company_id = v_company_id)
          AND split_part(p.storage_path, '/', 1) <> p.company_id::text
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.legacy_storage_path_map
        WHERE migrated_at IS NULL
      )
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_migration_health_report(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_migration_health_report(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 8. Marca migração física de um path como concluída (usado pelo script Node)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_storage_path_migrated(
  p_bucket_id TEXT,
  p_old_path TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  UPDATE public.legacy_storage_path_map
  SET migrated_at = NOW()
  WHERE bucket_id = p_bucket_id
    AND old_path = p_old_path
    AND migrated_at IS NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_storage_path_migrated(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_storage_path_migrated(TEXT, TEXT) TO authenticated;
