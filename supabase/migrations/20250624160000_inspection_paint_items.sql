CREATE TABLE IF NOT EXISTS public.inspection_paint_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  part_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDENTE',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT inspection_paint_items_status_check
    CHECK (status IN ('PENDENTE', 'ORIGINAL', 'RISCOS_AMASSADO', 'REPINTURA', 'REPINTURA_MASSA', 'AVARIADO', 'NA')),
  CONSTRAINT inspection_paint_items_part_unique UNIQUE (inspection_id, part_code)
);

CREATE INDEX IF NOT EXISTS idx_inspection_paint_items_inspection_id
  ON public.inspection_paint_items(inspection_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_inspection_paint_items_company_id
  ON public.inspection_paint_items(company_id)
  WHERE deleted_at IS NULL;

ALTER TABLE public.inspection_paint_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS paint_items_tenant ON public.inspection_paint_items;
CREATE POLICY paint_items_tenant ON public.inspection_paint_items FOR ALL
  USING (company_id = public.get_user_company_id() AND deleted_at IS NULL)
  WITH CHECK (company_id = public.get_user_company_id());

DROP TRIGGER IF EXISTS trg_inspection_paint_items_updated_at ON public.inspection_paint_items;
CREATE TRIGGER trg_inspection_paint_items_updated_at
  BEFORE UPDATE ON public.inspection_paint_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
