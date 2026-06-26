-- assign_inspection_number consultava MAX(inspection_number) com RLS ativo.
-- Vistoriadores só enxergam as próprias vistorias e recebiam números já usados
-- por outros usuários da mesma empresa, violando inspections_company_id_inspection_number_key.

CREATE OR REPLACE FUNCTION public.assign_inspection_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.inspection_number IS NULL OR NEW.inspection_number = 0 THEN
    PERFORM pg_advisory_xact_lock(hashtext(NEW.company_id::text));

    SELECT COALESCE(MAX(inspection_number), 0) + 1
      INTO NEW.inspection_number
      FROM public.inspections
      WHERE company_id = NEW.company_id;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_inspection_number() FROM PUBLIC, anon, authenticated;
