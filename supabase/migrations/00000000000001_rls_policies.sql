-- RLS policies (ver 20250623000001_rls_and_triggers.sql linhas 66-150)
-- Aplicado no Supabase cloud. Referência para novos ambientes.

DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['companies','roles','permissions','role_permissions','profiles','settings','inspections','inspection_checklists','inspection_photos','inspection_comments','inspection_reports','financial_entries','audit_logs','notifications']
  LOOP EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- Policies: ver migration completa em ../20250623000001_rls_and_triggers.sql
