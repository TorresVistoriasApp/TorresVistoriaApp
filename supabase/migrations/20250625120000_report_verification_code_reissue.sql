-- Permite reutilizar o mesmo código de verificação após soft-delete da versão anterior.
ALTER TABLE public.inspection_reports
  DROP CONSTRAINT IF EXISTS inspection_reports_verification_code_key;

DROP INDEX IF EXISTS public.inspection_reports_verification_code_active_key;

CREATE UNIQUE INDEX inspection_reports_verification_code_active_key
  ON public.inspection_reports (verification_code)
  WHERE deleted_at IS NULL;

COMMENT ON INDEX public.inspection_reports_verification_code_active_key IS
  'Um código de verificação ativo por laudo; versões anteriores são invalidadas via soft-delete.';
