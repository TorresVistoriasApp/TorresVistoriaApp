-- Alinha SELECT de fotos ao escopo da vistoria (igual inspections_select).
-- Path: {company_id}/{inspection_id}/{category}/{file}
-- Antes qualquer usuário da empresa podia assinar/baixar qualquer foto da empresa.

DROP POLICY IF EXISTS storage_photos_select ON storage.objects;
CREATE POLICY storage_photos_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'inspection-photos'
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspections i
        WHERE i.id::text = (storage.foldername(name))[2]
          AND i.company_id = public.get_user_company_id()
          AND i.inspector_id = auth.uid()
          AND i.deleted_at IS NULL
      )
    )
  );

DROP POLICY IF EXISTS storage_photos_insert ON storage.objects;
CREATE POLICY storage_photos_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'inspection-photos'
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspections i
        WHERE i.id::text = (storage.foldername(name))[2]
          AND i.company_id = public.get_user_company_id()
          AND i.inspector_id = auth.uid()
          AND i.deleted_at IS NULL
      )
    )
  );

DROP POLICY IF EXISTS storage_photos_update ON storage.objects;
CREATE POLICY storage_photos_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'inspection-photos'
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspections i
        WHERE i.id::text = (storage.foldername(name))[2]
          AND i.company_id = public.get_user_company_id()
          AND i.inspector_id = auth.uid()
          AND i.deleted_at IS NULL
      )
    )
  )
  WITH CHECK (
    bucket_id = 'inspection-photos'
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
  );

DROP POLICY IF EXISTS storage_photos_delete ON storage.objects;
CREATE POLICY storage_photos_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'inspection-photos'
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspections i
        WHERE i.id::text = (storage.foldername(name))[2]
          AND i.company_id = public.get_user_company_id()
          AND i.inspector_id = auth.uid()
          AND i.deleted_at IS NULL
      )
    )
  );
