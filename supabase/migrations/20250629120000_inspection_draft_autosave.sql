-- Rascunho automático: expiração, progresso e último auto-save
ALTER TABLE public.inspections
  ADD COLUMN IF NOT EXISTS draft_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completion_percent INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_auto_saved_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inspections_completion_percent_range'
  ) THEN
    ALTER TABLE public.inspections
      ADD CONSTRAINT inspections_completion_percent_range
      CHECK (completion_percent >= 0 AND completion_percent <= 100);
  END IF;
END $$;

-- Rascunhos existentes: expiração 24h a partir da criação
UPDATE public.inspections
SET draft_expires_at = created_at + INTERVAL '24 hours'
WHERE status = 'DRAFT'
  AND draft_expires_at IS NULL;

UPDATE public.inspections
SET draft_expires_at = NULL,
    completion_percent = 100
WHERE status IN ('COMPLETED', 'ARCHIVED');

CREATE OR REPLACE FUNCTION public.set_inspection_draft_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'DRAFT' THEN
    IF TG_OP = 'INSERT' AND NEW.draft_expires_at IS NULL THEN
      NEW.draft_expires_at := NOW() + INTERVAL '24 hours';
    END IF;
  ELSE
    NEW.draft_expires_at := NULL;
    IF NEW.status = 'COMPLETED' THEN
      NEW.completion_percent := 100;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_inspection_draft_expiry ON public.inspections;
CREATE TRIGGER trg_set_inspection_draft_expiry
  BEFORE INSERT OR UPDATE OF status
  ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_inspection_draft_expiry();

-- Remove rascunhos expirados (hard delete com CASCADE em fotos/checklist)
CREATE OR REPLACE FUNCTION public.cleanup_expired_inspection_drafts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed INTEGER := 0;
BEGIN
  WITH expired AS (
    DELETE FROM public.inspections
    WHERE status = 'DRAFT'
      AND draft_expires_at IS NOT NULL
      AND draft_expires_at < NOW()
      AND deleted_at IS NULL
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO removed FROM expired;

  RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_expired_inspection_drafts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_inspection_drafts() TO authenticated;

CREATE INDEX IF NOT EXISTS idx_inspections_draft_expires_at
  ON public.inspections (draft_expires_at)
  WHERE status = 'DRAFT' AND deleted_at IS NULL;
