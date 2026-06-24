-- Separa status pendente (não avaliado) de "não se aplica"
ALTER TABLE public.inspection_checklists
  DROP CONSTRAINT IF EXISTS checklist_status_check;

UPDATE public.inspection_checklists
SET status = 'PENDENTE'
WHERE status = 'NA';

ALTER TABLE public.inspection_checklists
  ALTER COLUMN status SET DEFAULT 'PENDENTE';

ALTER TABLE public.inspection_checklists
  ADD CONSTRAINT checklist_status_check
  CHECK (status IN ('PENDENTE', 'CONFORME', 'NAO_CONFORME', 'NA'));
