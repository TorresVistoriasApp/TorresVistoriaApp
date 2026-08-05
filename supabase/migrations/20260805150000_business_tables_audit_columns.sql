-- ETAPA 4 — REFATORAR TABELAS DE NEGÓCIO
--
-- Padroniza colunas de auditoria por usuário (created_by, updated_by, deleted_by)
-- em todas as entidades tenant. company_id + timestamps já existiam na maior
-- parte das tabelas desde a modelagem inicial.
--
-- Nota arquitetural:
--   • clients / vehicles — não existem como tabelas separadas; dados embutidos
--     em `inspections` (client_*, plate, chassis, brand, model, etc.).
--   • uploads — não existe tabela; arquivos ficam em `inspection_photos` +
--     Supabase Storage (Etapa 6 tratará paths).
--   • photo_sections / photo_categories — company_id permanece NULLABLE
--     (configs globais do sistema + overrides por tenant).

-- ---------------------------------------------------------------------------
-- 1. Colunas de auditoria por usuário (aditivo, nullable para backfill)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'inspections',
    'inspection_photos',
    'inspection_comments',
    'inspection_reports',
    'inspection_checklists',
    'inspection_paint_items',
    'inspection_types',
    'financial_entries',
    'settings',
    'notifications',
    'photo_sections',
    'photo_categories',
    'audit_logs',
    'companies'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I
         ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
         ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id),
         ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id)',
      t
    );
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. Backfill sem perda de dados
-- ---------------------------------------------------------------------------
UPDATE public.inspections
SET created_by = inspector_id
WHERE created_by IS NULL;

UPDATE public.inspection_photos p
SET created_by = COALESCE(p.uploaded_by, i.inspector_id)
FROM public.inspections i
WHERE i.id = p.inspection_id
  AND p.created_by IS NULL;

UPDATE public.inspection_comments
SET created_by = author_id
WHERE created_by IS NULL;

UPDATE public.inspection_reports
SET created_by = generated_by
WHERE created_by IS NULL;

UPDATE public.inspection_checklists c
SET created_by = i.inspector_id
FROM public.inspections i
WHERE i.id = c.inspection_id
  AND c.created_by IS NULL;

UPDATE public.inspection_paint_items pi
SET created_by = i.inspector_id
FROM public.inspections i
WHERE i.id = pi.inspection_id
  AND pi.created_by IS NULL;

-- financial_entries.created_by já era NOT NULL desde o schema inicial

UPDATE public.settings s
SET created_by = sub.profile_id
FROM (
  SELECT DISTINCT ON (p.company_id) p.company_id, p.id AS profile_id
  FROM public.profiles p
  WHERE p.deleted_at IS NULL
    AND p.role = 'SUPER_ADMIN'
  ORDER BY p.company_id, p.created_at
) sub
WHERE s.company_id = sub.company_id
  AND s.created_by IS NULL;

UPDATE public.inspection_types it
SET created_by = sub.profile_id
FROM (
  SELECT DISTINCT ON (p.company_id) p.company_id, p.id AS profile_id
  FROM public.profiles p
  WHERE p.deleted_at IS NULL
    AND p.role = 'SUPER_ADMIN'
  ORDER BY p.company_id, p.created_at
) sub
WHERE it.company_id = sub.company_id
  AND it.created_by IS NULL;

UPDATE public.companies c
SET created_by = sub.profile_id
FROM (
  SELECT DISTINCT ON (p.company_id) p.company_id, p.id AS profile_id
  FROM public.profiles p
  WHERE p.deleted_at IS NULL
    AND p.role = 'SUPER_ADMIN'
  ORDER BY p.company_id, p.created_at
) sub
WHERE c.id = sub.company_id
  AND c.created_by IS NULL;

-- audit_logs: user_id já identifica o autor do evento; espelha em created_by
UPDATE public.audit_logs
SET created_by = user_id
WHERE created_by IS NULL
  AND user_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. Índices para consultas por autor (RLS Etapa 5 usará created_by)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_inspections_company_created_by
  ON public.inspections(company_id, created_by)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_financial_entries_company_created_by
  ON public.financial_entries(company_id, created_by)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_inspection_photos_company_created_by
  ON public.inspection_photos(company_id, created_by)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- 4. Triggers: preencher created_by / updated_by / deleted_by automaticamente
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.stamp_row_audit_user_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF auth.uid() IS NOT NULL AND NEW.created_by IS NULL THEN
      NEW.created_by := auth.uid();
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF auth.uid() IS NOT NULL THEN
      NEW.updated_by := auth.uid();
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

REVOKE ALL ON FUNCTION public.stamp_row_audit_user_fields() FROM PUBLIC, anon;

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'inspections',
    'inspection_photos',
    'inspection_comments',
    'inspection_reports',
    'inspection_checklists',
    'inspection_paint_items',
    'inspection_types',
    'financial_entries',
    'settings',
    'notifications',
    'photo_sections',
    'photo_categories',
    'audit_logs',
    'companies'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_stamp_audit_users ON public.%I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_stamp_audit_users
         BEFORE INSERT OR UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.stamp_row_audit_user_fields()',
      t, t
    );
  END LOOP;
END;
$$;

-- Soft delete via DELETE agora também registra deleted_by
CREATE OR REPLACE FUNCTION public.soft_delete_row()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  EXECUTE format(
    'UPDATE %I.%I
       SET deleted_at = NOW(),
           updated_at = NOW(),
           deleted_by = $2
     WHERE id = $1
       AND deleted_at IS NULL',
    TG_TABLE_SCHEMA,
    TG_TABLE_NAME
  ) USING OLD.id, v_uid;
  RETURN NULL;
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. Auditoria em tabelas que ainda não tinham trigger
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_inspection_types_audit ON public.inspection_types;
CREATE TRIGGER trg_inspection_types_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.inspection_types
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

DROP TRIGGER IF EXISTS trg_inspection_paint_items_audit ON public.inspection_paint_items;
CREATE TRIGGER trg_inspection_paint_items_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.inspection_paint_items
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

DROP TRIGGER IF EXISTS trg_notifications_audit ON public.notifications;
CREATE TRIGGER trg_notifications_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

DROP TRIGGER IF EXISTS trg_photo_sections_audit ON public.photo_sections;
CREATE TRIGGER trg_photo_sections_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.photo_sections
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

DROP TRIGGER IF EXISTS trg_photo_categories_audit ON public.photo_categories;
CREATE TRIGGER trg_photo_categories_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.photo_categories
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();
