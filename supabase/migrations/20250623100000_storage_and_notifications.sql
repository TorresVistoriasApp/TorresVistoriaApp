-- Storage buckets + notification trigger

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('inspection-photos', 'inspection-photos', true, 52428800, ARRAY['image/webp', 'image/jpeg', 'image/png']),
  ('company-assets', 'company-assets', true, 10485760, ARRAY['image/webp', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS storage_photos_select ON storage.objects;
DROP POLICY IF EXISTS storage_photos_insert ON storage.objects;
DROP POLICY IF EXISTS storage_photos_update ON storage.objects;
DROP POLICY IF EXISTS storage_photos_delete ON storage.objects;

CREATE POLICY storage_photos_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'inspection-photos' AND (storage.foldername(name))[1] = public.get_user_company_id()::text);

CREATE POLICY storage_photos_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'inspection-photos' AND (storage.foldername(name))[1] = public.get_user_company_id()::text);

CREATE POLICY storage_photos_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'inspection-photos' AND (storage.foldername(name))[1] = public.get_user_company_id()::text)
  WITH CHECK (bucket_id = 'inspection-photos' AND (storage.foldername(name))[1] = public.get_user_company_id()::text);

CREATE POLICY storage_photos_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'inspection-photos' AND (storage.foldername(name))[1] = public.get_user_company_id()::text);

DROP POLICY IF EXISTS storage_assets_select ON storage.objects;
DROP POLICY IF EXISTS storage_assets_insert ON storage.objects;
DROP POLICY IF EXISTS storage_assets_update ON storage.objects;
DROP POLICY IF EXISTS storage_assets_delete ON storage.objects;

CREATE POLICY storage_assets_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'company-assets' AND (storage.foldername(name))[1] = public.get_user_company_id()::text);

CREATE POLICY storage_assets_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'company-assets' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.is_super_admin());

CREATE POLICY storage_assets_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'company-assets' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.is_super_admin())
  WITH CHECK (bucket_id = 'company-assets' AND (storage.foldername(name))[1] = public.get_user_company_id()::text);

CREATE POLICY storage_assets_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'company-assets' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.is_super_admin());

CREATE OR REPLACE FUNCTION public.notify_inspection_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.notifications (company_id, user_id, title, body, metadata)
    SELECT
      NEW.company_id,
      p.id,
      'Vistoria concluída',
      'Vistoria #' || NEW.inspection_number || ' (' || NEW.plate || ') foi concluída.',
      jsonb_build_object('inspection_id', NEW.id, 'type', 'inspection_completed')
    FROM public.profiles p
    WHERE p.company_id = NEW.company_id
      AND p.role = 'SUPER_ADMIN'
      AND p.deleted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_inspection_completed ON public.inspections;
CREATE TRIGGER trg_notify_inspection_completed
  AFTER UPDATE OF status ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION public.notify_inspection_completed();
