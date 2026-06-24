-- Dashboard: receita real a partir dos valores configurados em inspection_types
-- Funciona para todos os perfis (admin = empresa inteira, vistoriador = suas vistorias)

CREATE OR REPLACE FUNCTION public.dashboard_inspector_scope()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.is_super_admin() THEN NULL::UUID
    WHEN (
      SELECT role FROM public.profiles
      WHERE id = auth.uid() AND deleted_at IS NULL
    ) = 'VISTORIADOR' THEN auth.uid()
    ELSE NULL::UUID
  END;
$$;

CREATE OR REPLACE FUNCTION public.company_inspection_revenue(
  p_company_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_inspector_id UUID DEFAULT NULL
)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(it.amount), 0)
  FROM public.inspections i
  INNER JOIN public.inspection_types it
    ON it.id = i.inspection_type_id
    AND it.deleted_at IS NULL
    AND it.is_active = true
  WHERE i.company_id = p_company_id
    AND i.deleted_at IS NULL
    AND (p_start_date IS NULL OR i.inspection_date >= p_start_date)
    AND (p_end_date IS NULL OR i.inspection_date <= p_end_date)
    AND (p_inspector_id IS NULL OR i.inspector_id = p_inspector_id);
$$;

CREATE OR REPLACE FUNCTION public.company_manual_revenue(
  p_company_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(f.amount), 0)
  FROM public.financial_entries f
  WHERE f.company_id = p_company_id
    AND f.entry_type = 'RECEITA'
    AND f.deleted_at IS NULL
    AND f.inspection_id IS NULL
    AND (p_start_date IS NULL OR f.entry_date >= p_start_date)
    AND (p_end_date IS NULL OR f.entry_date <= p_end_date);
$$;

-- Vincular vistorias antigas sem tipo ao tipo padrão da empresa
UPDATE public.inspections i
SET inspection_type_id = it.id
FROM public.inspection_types it
WHERE i.inspection_type_id IS NULL
  AND i.deleted_at IS NULL
  AND it.company_id = i.company_id
  AND it.deleted_at IS NULL
  AND it.is_active = true
  AND it.name = 'Vistoria Cautelar';

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
  v_total_inspections INTEGER;
  v_inspector_id UUID;
  v_year_start DATE := date_trunc('year', CURRENT_DATE)::DATE;
BEGIN
  IF NOT public.is_super_admin() AND public.get_user_company_id() IS DISTINCT FROM p_company_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_inspector_id := public.dashboard_inspector_scope();

  SELECT COUNT(*)::INTEGER INTO v_inspections_ytd
  FROM public.inspections i
  WHERE i.company_id = p_company_id
    AND i.deleted_at IS NULL
    AND i.inspection_date >= v_year_start
    AND (v_inspector_id IS NULL OR i.inspector_id = v_inspector_id);

  SELECT COUNT(*)::INTEGER INTO v_total_inspections
  FROM public.inspections i
  WHERE i.company_id = p_company_id
    AND i.deleted_at IS NULL
    AND (v_inspector_id IS NULL OR i.inspector_id = v_inspector_id);

  v_revenue := public.company_inspection_revenue(p_company_id, v_year_start, NULL, v_inspector_id);

  IF v_inspector_id IS NULL THEN
    v_revenue := v_revenue + public.company_manual_revenue(p_company_id, v_year_start, NULL);

    SELECT COALESCE(SUM(amount), 0) INTO v_expenses
    FROM public.financial_entries
    WHERE company_id = p_company_id
      AND entry_type IN ('DESPESA', 'CUSTO')
      AND deleted_at IS NULL
      AND entry_date >= v_year_start;
  ELSE
    v_expenses := 0;
  END IF;

  SELECT jsonb_build_object(
    'totalInspections', v_total_inspections,
    'totalRevenue', v_revenue,
    'netProfit', v_revenue - v_expenses,
    'averageTicket', CASE
      WHEN v_inspections_ytd > 0 THEN ROUND(v_revenue / v_inspections_ytd, 2)
      ELSE 0
    END,
    'pendingInspections', (
      SELECT COUNT(*) FROM public.inspections i
      WHERE i.company_id = p_company_id
        AND i.status = 'DRAFT'
        AND i.deleted_at IS NULL
        AND (v_inspector_id IS NULL OR i.inspector_id = v_inspector_id)
    ),
    'completedInspections', (
      SELECT COUNT(*) FROM public.inspections i
      WHERE i.company_id = p_company_id
        AND i.status = 'COMPLETED'
        AND i.deleted_at IS NULL
        AND (v_inspector_id IS NULL OR i.inspector_id = v_inspector_id)
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_monthly_inspections(
  p_company_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS TABLE (month TEXT, count BIGINT, revenue NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inspector_id UUID;
BEGIN
  IF NOT public.is_super_admin() AND public.get_user_company_id() IS DISTINCT FROM p_company_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_inspector_id := public.dashboard_inspector_scope();

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
      AND (v_inspector_id IS NULL OR i.inspector_id = v_inspector_id)
    GROUP BY 1
  ),
  inspection_revenue AS (
    SELECT
      TO_CHAR(DATE_TRUNC('month', i.inspection_date), 'YYYY-MM') AS month_key,
      COALESCE(SUM(it.amount), 0) AS total_revenue
    FROM public.inspections i
    INNER JOIN public.inspection_types it
      ON it.id = i.inspection_type_id
      AND it.deleted_at IS NULL
      AND it.is_active = true
    WHERE i.company_id = p_company_id
      AND EXTRACT(YEAR FROM i.inspection_date) = p_year
      AND i.deleted_at IS NULL
      AND (v_inspector_id IS NULL OR i.inspector_id = v_inspector_id)
    GROUP BY 1
  ),
  manual_revenue AS (
    SELECT
      TO_CHAR(DATE_TRUNC('month', f.entry_date), 'YYYY-MM') AS month_key,
      COALESCE(SUM(f.amount), 0) AS total_revenue
    FROM public.financial_entries f
    WHERE f.company_id = p_company_id
      AND f.entry_type = 'RECEITA'
      AND f.deleted_at IS NULL
      AND f.inspection_id IS NULL
      AND EXTRACT(YEAR FROM f.entry_date) = p_year
      AND v_inspector_id IS NULL
    GROUP BY 1
  ),
  revenue_totals AS (
    SELECT month_key, SUM(total_revenue) AS total_revenue
    FROM (
      SELECT * FROM inspection_revenue
      UNION ALL
      SELECT * FROM manual_revenue
    ) combined
    GROUP BY month_key
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

CREATE OR REPLACE FUNCTION public.get_inspections_by_brand(p_company_id UUID)
RETURNS TABLE (brand TEXT, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inspector_id UUID;
BEGIN
  IF NOT public.is_super_admin() AND public.get_user_company_id() IS DISTINCT FROM p_company_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_inspector_id := public.dashboard_inspector_scope();

  RETURN QUERY
  SELECT i.brand, COUNT(*)::BIGINT
  FROM public.inspections i
  WHERE i.company_id = p_company_id
    AND i.deleted_at IS NULL
    AND (v_inspector_id IS NULL OR i.inspector_id = v_inspector_id)
  GROUP BY i.brand
  ORDER BY count DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_financial_summary(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_revenue NUMERIC;
  v_expenses NUMERIC;
  v_costs NUMERIC;
BEGIN
  IF NOT public.is_super_admin() AND public.get_user_company_id() IS DISTINCT FROM p_company_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_revenue := public.company_inspection_revenue(p_company_id, p_start_date, p_end_date, NULL)
    + public.company_manual_revenue(p_company_id, p_start_date, p_end_date);

  SELECT
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'DESPESA'), 0),
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'CUSTO'), 0)
  INTO v_expenses, v_costs
  FROM public.financial_entries
  WHERE company_id = p_company_id
    AND entry_date BETWEEN p_start_date AND p_end_date
    AND deleted_at IS NULL;

  RETURN jsonb_build_object(
    'totalRevenue', v_revenue,
    'totalExpenses', v_expenses,
    'totalCosts', v_costs,
    'netProfit', v_revenue - v_expenses - v_costs,
    'margin', CASE
      WHEN v_revenue > 0 THEN ROUND((v_revenue - v_expenses - v_costs) / v_revenue * 100, 2)
      ELSE 0
    END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.dashboard_inspector_scope() TO authenticated;
GRANT EXECUTE ON FUNCTION public.company_inspection_revenue(UUID, DATE, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.company_manual_revenue(UUID, DATE, DATE) TO authenticated;
