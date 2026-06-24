-- Separa status pendente (não avaliado) de "não se aplica"
UPDATE public.inspection_checklists
SET status = 'PENDENTE'
WHERE status = 'NA';

ALTER TABLE public.inspection_checklists
  ALTER COLUMN status SET DEFAULT 'PENDENTE';
