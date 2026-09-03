-- Fase G: o PDF oficial nasce só no servidor (service_role).
-- Cliente autenticado continua podendo LER o laudo do próprio tenant;
-- não pode mais enviar, sobrescrever ou apagar o arquivo oficial.

DROP POLICY IF EXISTS storage_reports_insert ON storage.objects;
DROP POLICY IF EXISTS storage_reports_update ON storage.objects;

-- Metadados do laudo também deixam de ser gravados pelo JWT do cliente.
DROP POLICY IF EXISTS reports_insert ON public.inspection_reports;
DROP POLICY IF EXISTS reports_update ON public.inspection_reports;
DROP POLICY IF EXISTS reports_delete ON public.inspection_reports;

-- ---------------------------------------------------------------------------
-- Congela o conteúdo da vistoria depois que o laudo oficial é emitido.
-- Soft-delete e arquivo continuam permitidos.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_completed_inspection_tamper()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_TABLE_NAME = 'inspections' THEN
    IF TG_OP = 'UPDATE'
       AND OLD.status = 'COMPLETED'
       AND OLD.deleted_at IS NULL
       AND NEW.deleted_at IS NULL
       AND NEW.status IS NOT DISTINCT FROM 'COMPLETED'
       AND (
         NEW.plate IS DISTINCT FROM OLD.plate
         OR NEW.chassis IS DISTINCT FROM OLD.chassis
         OR NEW.renavam IS DISTINCT FROM OLD.renavam
         OR NEW.opinion IS DISTINCT FROM OLD.opinion
         OR NEW.technical_notes IS DISTINCT FROM OLD.technical_notes
         OR NEW.client_name IS DISTINCT FROM OLD.client_name
         OR NEW.client_document IS DISTINCT FROM OLD.client_document
         OR NEW.brand IS DISTINCT FROM OLD.brand
         OR NEW.model IS DISTINCT FROM OLD.model
         OR NEW.mileage IS DISTINCT FROM OLD.mileage
         OR NEW.inspection_number IS DISTINCT FROM OLD.inspection_number
         OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
       ) THEN
      RAISE EXCEPTION 'Vistoria concluída não pode ser alterada.';
    END IF;
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.inspections i
    WHERE i.id = COALESCE(NEW.inspection_id, OLD.inspection_id)
      AND i.status = 'COMPLETED'
      AND i.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Vistoria concluída não pode ser alterada.';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_completed_inspection_tamper ON public.inspections;
CREATE TRIGGER trg_prevent_completed_inspection_tamper
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_completed_inspection_tamper();

DROP TRIGGER IF EXISTS trg_prevent_completed_checklist_tamper ON public.inspection_checklists;
CREATE TRIGGER trg_prevent_completed_checklist_tamper
  BEFORE INSERT OR UPDATE OR DELETE ON public.inspection_checklists
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_completed_inspection_tamper();

DROP TRIGGER IF EXISTS trg_prevent_completed_photos_tamper ON public.inspection_photos;
CREATE TRIGGER trg_prevent_completed_photos_tamper
  BEFORE INSERT OR UPDATE OR DELETE ON public.inspection_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_completed_inspection_tamper();

REVOKE ALL ON FUNCTION public.prevent_completed_inspection_tamper()
  FROM PUBLIC, anon, authenticated;
