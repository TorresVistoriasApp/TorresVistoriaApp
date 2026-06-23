-- Passo 3: soft delete via trigger (DELETE vira UPDATE deleted_at)

CREATE OR REPLACE FUNCTION public.soft_delete_row()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I.%I SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
    TG_TABLE_SCHEMA,
    TG_TABLE_NAME
  ) USING OLD.id;
  RETURN NULL;
END;
$$;

DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['companies', 'profiles', 'inspections', 'financial_entries']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_soft_delete ON public.%I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_soft_delete BEFORE DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.soft_delete_row()',
      t, t
    );
  END LOOP;
END $$;
