-- Soft delete faz UPDATE em deleted_at; sem WITH CHECK explícito, o Postgres
-- reutiliza USING (deleted_at IS NULL) e rejeita a linha resultante.

DROP POLICY IF EXISTS inspections_update ON public.inspections;
CREATE POLICY inspections_update ON public.inspections FOR UPDATE
  USING (
    company_id = public.get_user_company_id()
    AND deleted_at IS NULL
    AND (public.is_super_admin() OR inspector_id = auth.uid())
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    AND (public.is_super_admin() OR inspector_id = auth.uid())
  );
