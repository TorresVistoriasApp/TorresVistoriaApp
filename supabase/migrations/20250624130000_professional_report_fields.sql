-- Campos profissionais para laudo cautelar, venda, DETRAN e uso judicial.
ALTER TABLE public.inspections
  ADD COLUMN IF NOT EXISTS inspection_purpose TEXT DEFAULT 'CAUTELAR',
  ADD COLUMN IF NOT EXISTS requester_name TEXT,
  ADD COLUMN IF NOT EXISTS requester_document TEXT,
  ADD COLUMN IF NOT EXISTS buyer_name TEXT,
  ADD COLUMN IF NOT EXISTS buyer_document TEXT,
  ADD COLUMN IF NOT EXISTS seller_name TEXT,
  ADD COLUMN IF NOT EXISTS seller_document TEXT,
  ADD COLUMN IF NOT EXISTS judicial_process TEXT,
  ADD COLUMN IF NOT EXISTS judicial_court TEXT,
  ADD COLUMN IF NOT EXISTS judicial_district TEXT,
  ADD COLUMN IF NOT EXISTS motor_number TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_uf TEXT,
  ADD COLUMN IF NOT EXISTS registration_city_uf TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_category TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_species TEXT,
  ADD COLUMN IF NOT EXISTS passenger_capacity INTEGER,
  ADD COLUMN IF NOT EXISTS power_cv INTEGER,
  ADD COLUMN IF NOT EXISTS engine_displacement INTEGER,
  ADD COLUMN IF NOT EXISTS market_fipe_value NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS market_average_value NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS insurance_acceptance_percent NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS vehicle_condition TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('reports', 'reports', true, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS storage_reports_select ON storage.objects;
DROP POLICY IF EXISTS storage_reports_insert ON storage.objects;
DROP POLICY IF EXISTS storage_reports_update ON storage.objects;
DROP POLICY IF EXISTS storage_reports_delete ON storage.objects;

CREATE POLICY storage_reports_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'reports' AND (storage.foldername(name))[1] = public.get_user_company_id()::text);

CREATE POLICY storage_reports_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'reports' AND (storage.foldername(name))[1] = public.get_user_company_id()::text);

CREATE POLICY storage_reports_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'reports' AND (storage.foldername(name))[1] = public.get_user_company_id()::text)
  WITH CHECK (bucket_id = 'reports' AND (storage.foldername(name))[1] = public.get_user_company_id()::text);

CREATE POLICY storage_reports_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'reports' AND (storage.foldername(name))[1] = public.get_user_company_id()::text);

