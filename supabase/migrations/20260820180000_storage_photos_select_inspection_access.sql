-- Storage inspection-photos: SELECT alinhado ao acesso da vistoria.
-- Antes só o created_by da foto (ou super_admin) lia o objeto — admin/outro
-- usuário do tenant via PDF falhava no download autenticado mesmo vendo a galeria
-- (URL assinada gerada na listagem podia mascarar o problema até expirar).

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
          AND public.can_access_tenant_row(i.tenant_id, i.created_by)
      )
    )
  );
