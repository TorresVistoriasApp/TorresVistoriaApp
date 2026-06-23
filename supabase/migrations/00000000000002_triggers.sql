-- Triggers e índices (referência — ver 20250623000001_rls_and_triggers.sql)

CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inspections_company_id ON public.inspections(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inspections_plate ON public.inspections(plate) WHERE deleted_at IS NULL;

-- Triggers: assign_inspection_number, audit_log_changes, handle_new_user, on_auth_user_created
