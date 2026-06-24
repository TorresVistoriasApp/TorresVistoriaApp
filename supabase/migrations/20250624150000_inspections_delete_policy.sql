-- Soft delete usa trigger BEFORE DELETE (SECURITY DEFINER), não UPDATE direto.
-- UPDATE com deleted_at falha no WITH CHECK mesmo com política corrigida.

DROP POLICY IF EXISTS inspections_delete ON public.inspections;
CREATE POLICY inspections_delete ON public.inspections FOR DELETE
  USING (
    company_id = public.get_user_company_id()
    AND deleted_at IS NULL
    AND (public.is_super_admin() OR inspector_id = auth.uid())
  );
