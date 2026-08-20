-- Restaura SELECT de fotos: created_by da foto (como antes) + acesso à vistoria.
-- A policy anterior (só can_access_tenant_row na inspection) derrubou createSignedUrl
-- e download para quem tinha URL válida na tela, zerando todas as fotos no PDF.

DROP POLICY IF EXISTS storage_photos_select ON storage.objects;
CREATE POLICY storage_photos_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'inspection-photos'
    AND public.is_canonical_inspection_photo_object_path(name)
    AND (storage.foldername(name))[1] = public.get_user_tenant_id()::text
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspection_photos p
        JOIN public.inspections i
          ON i.id = p.inspection_id
         AND i.deleted_at IS NULL
        WHERE p.deleted_at IS NULL
          AND public.inspection_photo_matches_storage_object(
            p.storage_path,
            p.thumbnail_url,
            storage.objects.name
          )
          AND (
            p.created_by = auth.uid()
            OR public.can_access_tenant_row(i.tenant_id, i.created_by)
          )
      )
    )
  );
