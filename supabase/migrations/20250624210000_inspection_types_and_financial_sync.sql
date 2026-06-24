-- Tipos de vistoria (preços por empresa) + sincronização financeira automática

CREATE TABLE IF NOT EXISTS public.inspection_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT inspection_types_name_company_unique UNIQUE (company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_inspection_types_company_id
  ON public.inspection_types(company_id)
  WHERE deleted_at IS NULL;

ALTER TABLE public.inspections
  ADD COLUMN IF NOT EXISTS inspection_type_id UUID REFERENCES public.inspection_types(id);

CREATE INDEX IF NOT EXISTS idx_inspections_type_id
  ON public.inspections(inspection_type_id)
  WHERE deleted_at IS NULL;

ALTER TABLE public.financial_entries
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'MANUAL';

ALTER TABLE public.financial_entries
  DROP CONSTRAINT IF EXISTS financial_entries_source_check;

ALTER TABLE public.financial_entries
  ADD CONSTRAINT financial_entries_source_check
  CHECK (source IN ('MANUAL', 'INSPECTION'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_inspection_auto
  ON public.financial_entries(inspection_id)
  WHERE source = 'INSPECTION' AND deleted_at IS NULL AND inspection_id IS NOT NULL;

-- Tipos padrão para empresas existentes
INSERT INTO public.inspection_types (company_id, name, amount, sort_order)
SELECT c.id, t.name, t.amount, t.sort_order
FROM public.companies c
CROSS JOIN (
  VALUES
    ('Vistoria Cautelar', 350.00, 1),
    ('Vistoria para Venda', 300.00, 2),
    ('Vistoria Detran', 250.00, 3),
    ('Vistoria Judicial', 400.00, 4),
    ('Vistoria Seguradora', 350.00, 5),
    ('Vistoria Leilão', 280.00, 6)
) AS t(name, amount, sort_order)
WHERE c.deleted_at IS NULL
ON CONFLICT (company_id, name) DO NOTHING;

-- Vincular demo existente ao tipo "Vistoria Cautelar"
UPDATE public.inspections i
SET inspection_type_id = it.id,
    inspection_purpose = it.name
FROM public.inspection_types it
WHERE i.id = '22222222-2222-4222-8222-222222222201'
  AND it.company_id = i.company_id
  AND it.name = 'Vistoria Cautelar'
  AND it.deleted_at IS NULL;

UPDATE public.financial_entries
SET source = 'INSPECTION'
WHERE id = '33333333-3333-4333-8333-333333333301';

ALTER TABLE public.inspection_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inspection_types_select ON public.inspection_types;
CREATE POLICY inspection_types_select ON public.inspection_types FOR SELECT
  USING (company_id = public.get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS inspection_types_admin ON public.inspection_types;
CREATE POLICY inspection_types_admin ON public.inspection_types FOR ALL
  USING (company_id = public.get_user_company_id() AND public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() AND public.is_super_admin());

DROP TRIGGER IF EXISTS trg_inspection_types_updated_at ON public.inspection_types;
CREATE TRIGGER trg_inspection_types_updated_at
  BEFORE UPDATE ON public.inspection_types
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_inspection_types_soft_delete ON public.inspection_types;
CREATE TRIGGER trg_inspection_types_soft_delete
  BEFORE DELETE ON public.inspection_types
  FOR EACH ROW EXECUTE FUNCTION public.soft_delete_row();

-- Sincroniza lançamento de receita automático ao criar/editar vistoria
CREATE OR REPLACE FUNCTION public.sync_inspection_financial_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_amount NUMERIC(12, 2);
  v_type_name TEXT;
  v_entry_id UUID;
  v_entry_source TEXT;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    UPDATE public.financial_entries
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE inspection_id = NEW.id
      AND source = 'INSPECTION'
      AND deleted_at IS NULL;
    RETURN NEW;
  END IF;

  IF NEW.deleted_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.inspection_type_id IS NULL THEN
    UPDATE public.financial_entries
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE inspection_id = NEW.id
      AND source = 'INSPECTION'
      AND deleted_at IS NULL;
    RETURN NEW;
  END IF;

  SELECT it.amount, it.name
  INTO v_amount, v_type_name
  FROM public.inspection_types it
  WHERE it.id = NEW.inspection_type_id
    AND it.company_id = NEW.company_id
    AND it.deleted_at IS NULL
    AND it.is_active = true;

  IF v_type_name IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT fe.id, fe.source
  INTO v_entry_id, v_entry_source
  FROM public.financial_entries fe
  WHERE fe.inspection_id = NEW.id
    AND fe.entry_type = 'RECEITA'
    AND fe.deleted_at IS NULL
  ORDER BY CASE WHEN fe.source = 'INSPECTION' THEN 0 ELSE 1 END
  LIMIT 1;

  IF v_entry_id IS NOT NULL AND v_entry_source = 'MANUAL' THEN
    RETURN NEW;
  END IF;

  IF v_entry_id IS NULL THEN
    INSERT INTO public.financial_entries (
      company_id,
      inspection_id,
      entry_type,
      description,
      amount,
      entry_date,
      source,
      created_by
    ) VALUES (
      NEW.company_id,
      NEW.id,
      'RECEITA',
      'Vistoria ' || v_type_name || ' #' || NEW.inspection_number,
      v_amount,
      NEW.inspection_date,
      'INSPECTION',
      NEW.inspector_id
    );
  ELSE
    UPDATE public.financial_entries
    SET
      amount = v_amount,
      entry_date = NEW.inspection_date,
      description = 'Vistoria ' || v_type_name || ' #' || NEW.inspection_number,
      source = 'INSPECTION',
      deleted_at = NULL,
      updated_at = NOW()
    WHERE id = v_entry_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_inspection_financial ON public.inspections;
CREATE TRIGGER trg_sync_inspection_financial
  AFTER INSERT OR UPDATE OF inspection_type_id, inspection_date, deleted_at
  ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_inspection_financial_entry();

-- Recalcula receitas vinculadas quando o preço do tipo muda
CREATE OR REPLACE FUNCTION public.sync_inspection_type_price_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.amount IS DISTINCT FROM OLD.amount AND NEW.deleted_at IS NULL THEN
    UPDATE public.financial_entries fe
    SET
      amount = NEW.amount,
      description = 'Vistoria ' || NEW.name || ' #' || i.inspection_number,
      updated_at = NOW()
    FROM public.inspections i
    WHERE i.inspection_type_id = NEW.id
      AND i.deleted_at IS NULL
      AND fe.inspection_id = i.id
      AND fe.source = 'INSPECTION'
      AND fe.deleted_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_inspection_type_price ON public.inspection_types;
CREATE TRIGGER trg_sync_inspection_type_price
  AFTER UPDATE OF amount, name
  ON public.inspection_types
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_inspection_type_price_change();

-- KPIs alinhados ao ano corrente (entry_date) e receita real registrada
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_company_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_revenue NUMERIC;
  v_expenses NUMERIC;
  v_inspections_ytd INTEGER;
  v_year_start DATE := date_trunc('year', CURRENT_DATE)::DATE;
BEGIN
  IF NOT public.is_super_admin() AND public.get_user_company_id() IS DISTINCT FROM p_company_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_inspections_ytd
  FROM public.inspections
  WHERE company_id = p_company_id
    AND deleted_at IS NULL
    AND inspection_date >= v_year_start;

  SELECT COALESCE(SUM(amount), 0) INTO v_revenue
  FROM public.financial_entries
  WHERE company_id = p_company_id
    AND entry_type = 'RECEITA'
    AND deleted_at IS NULL
    AND entry_date >= v_year_start;

  SELECT COALESCE(SUM(amount), 0) INTO v_expenses
  FROM public.financial_entries
  WHERE company_id = p_company_id
    AND entry_type IN ('DESPESA', 'CUSTO')
    AND deleted_at IS NULL
    AND entry_date >= v_year_start;

  SELECT jsonb_build_object(
    'totalInspections', (
      SELECT COUNT(*) FROM public.inspections
      WHERE company_id = p_company_id AND deleted_at IS NULL
    ),
    'totalRevenue', v_revenue,
    'netProfit', v_revenue - v_expenses,
    'averageTicket', CASE
      WHEN v_inspections_ytd > 0 THEN ROUND(v_revenue / v_inspections_ytd, 2)
      ELSE 0
    END,
    'pendingInspections', (
      SELECT COUNT(*) FROM public.inspections
      WHERE company_id = p_company_id AND status = 'DRAFT' AND deleted_at IS NULL
    ),
    'completedInspections', (
      SELECT COUNT(*) FROM public.inspections
      WHERE company_id = p_company_id AND status = 'COMPLETED' AND deleted_at IS NULL
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Gráfico mensal: contagem de vistorias + receita real por entry_date
CREATE OR REPLACE FUNCTION public.get_monthly_inspections(
  p_company_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS TABLE (month TEXT, count BIGINT, revenue NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() AND public.get_user_company_id() IS DISTINCT FROM p_company_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  WITH months AS (
    SELECT TO_CHAR(d, 'YYYY-MM') AS month_key
    FROM generate_series(
      make_date(p_year, 1, 1),
      make_date(p_year, 12, 1),
      '1 month'::interval
    ) AS d
  ),
  inspection_counts AS (
    SELECT
      TO_CHAR(DATE_TRUNC('month', i.inspection_date), 'YYYY-MM') AS month_key,
      COUNT(*)::BIGINT AS inspection_count
    FROM public.inspections i
    WHERE i.company_id = p_company_id
      AND EXTRACT(YEAR FROM i.inspection_date) = p_year
      AND i.deleted_at IS NULL
    GROUP BY 1
  ),
  revenue_totals AS (
    SELECT
      TO_CHAR(DATE_TRUNC('month', f.entry_date), 'YYYY-MM') AS month_key,
      COALESCE(SUM(f.amount), 0) AS total_revenue
    FROM public.financial_entries f
    WHERE f.company_id = p_company_id
      AND f.entry_type = 'RECEITA'
      AND f.deleted_at IS NULL
      AND EXTRACT(YEAR FROM f.entry_date) = p_year
    GROUP BY 1
  )
  SELECT
    m.month_key,
    COALESCE(ic.inspection_count, 0),
    COALESCE(rt.total_revenue, 0)
  FROM months m
  LEFT JOIN inspection_counts ic ON ic.month_key = m.month_key
  LEFT JOIN revenue_totals rt ON rt.month_key = m.month_key
  ORDER BY m.month_key;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_inspection_financial_entry() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_inspection_type_price_change() TO authenticated;
