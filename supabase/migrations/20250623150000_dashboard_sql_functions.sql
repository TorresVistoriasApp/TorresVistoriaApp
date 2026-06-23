-- Passo 3: funções SQL (adaptadas ao schema v2 — 14 tabelas)

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
  v_total INTEGER;
BEGIN
  IF NOT public.is_super_admin() AND public.get_user_company_id() IS DISTINCT FROM p_company_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_total
  FROM public.inspections
  WHERE company_id = p_company_id AND deleted_at IS NULL;

  SELECT COALESCE(SUM(amount), 0) INTO v_revenue
  FROM public.financial_entries
  WHERE company_id = p_company_id AND entry_type = 'RECEITA' AND deleted_at IS NULL;

  SELECT COALESCE(SUM(amount), 0) INTO v_expenses
  FROM public.financial_entries
  WHERE company_id = p_company_id AND entry_type IN ('DESPESA', 'CUSTO') AND deleted_at IS NULL;

  SELECT jsonb_build_object(
    'totalInspections', v_total,
    'totalRevenue', v_revenue,
    'netProfit', v_revenue - v_expenses,
    'averageTicket', CASE WHEN v_total > 0 THEN ROUND(v_revenue / v_total, 2) ELSE 0 END,
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
  SELECT
    TO_CHAR(DATE_TRUNC('month', i.inspection_date), 'YYYY-MM') AS month,
    COUNT(*)::BIGINT AS count,
    COALESCE(SUM(f.amount), 0) AS revenue
  FROM public.inspections i
  LEFT JOIN public.financial_entries f
    ON f.inspection_id = i.id AND f.entry_type = 'RECEITA' AND f.deleted_at IS NULL
  WHERE i.company_id = p_company_id
    AND EXTRACT(YEAR FROM i.inspection_date) = p_year
    AND i.deleted_at IS NULL
  GROUP BY DATE_TRUNC('month', i.inspection_date)
  ORDER BY month;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_inspections_by_brand(p_company_id UUID)
RETURNS TABLE (brand TEXT, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() AND public.get_user_company_id() IS DISTINCT FROM p_company_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  SELECT i.brand, COUNT(*)::BIGINT
  FROM public.inspections i
  WHERE i.company_id = p_company_id AND i.deleted_at IS NULL
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

  SELECT
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'RECEITA'), 0),
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'DESPESA'), 0),
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'CUSTO'), 0)
  INTO v_revenue, v_expenses, v_costs
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

CREATE OR REPLACE FUNCTION public.search_inspections(
  p_company_id UUID,
  p_query TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  inspection_number INTEGER,
  inspection_date DATE,
  client_name TEXT,
  plate TEXT,
  brand TEXT,
  model TEXT,
  status TEXT,
  opinion TEXT,
  reporter_name TEXT,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.get_user_company_id() IS DISTINCT FROM p_company_id AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  WITH filtered AS (
    SELECT
      i.*,
      p.full_name AS reporter_name,
      COUNT(*) OVER () AS total_count
    FROM public.inspections i
    LEFT JOIN public.profiles p ON p.id = i.inspector_id
    WHERE i.company_id = p_company_id
      AND i.deleted_at IS NULL
      AND (
        p_query IS NULL
        OR i.plate ILIKE '%' || p_query || '%'
        OR i.client_name ILIKE '%' || p_query || '%'
        OR i.brand ILIKE '%' || p_query || '%'
        OR CAST(i.inspection_number AS TEXT) ILIKE '%' || p_query || '%'
      )
      AND (p_status IS NULL OR i.status = p_status)
      AND (p_start_date IS NULL OR i.inspection_date >= p_start_date)
      AND (p_end_date IS NULL OR i.inspection_date <= p_end_date)
  )
  SELECT
    f.id,
    f.inspection_number,
    f.inspection_date,
    f.client_name,
    f.plate,
    f.brand,
    f.model,
    f.status,
    f.opinion,
    f.reporter_name,
    f.total_count
  FROM filtered f
  ORDER BY f.inspection_date DESC, f.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_report(p_verification_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_report RECORD;
BEGIN
  SELECT
    r.*,
    i.inspection_number,
    i.plate,
    i.brand,
    i.model,
    i.opinion,
    i.inspection_date
  INTO v_report
  FROM public.inspection_reports r
  JOIN public.inspections i ON i.id = r.inspection_id
  WHERE r.verification_code = p_verification_code
    AND r.deleted_at IS NULL
    AND i.deleted_at IS NULL
  LIMIT 1;

  IF v_report IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Código de verificação não encontrado');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'inspectionNumber', v_report.inspection_number,
    'vehiclePlate', v_report.plate,
    'vehicleBrand', v_report.brand,
    'vehicleModel', v_report.model,
    'parecer', v_report.opinion,
    'inspectionDate', v_report.inspection_date,
    'generatedAt', v_report.created_at,
    'hash', v_report.integrity_hash
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_inspections(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_inspections_by_brand(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_financial_summary(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_inspections(UUID, TEXT, TEXT, DATE, DATE, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_report(TEXT) TO authenticated, anon;

REVOKE ALL ON FUNCTION public.get_dashboard_stats(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.get_monthly_inspections(UUID, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.get_inspections_by_brand(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.get_financial_summary(UUID, DATE, DATE) FROM anon;
REVOKE ALL ON FUNCTION public.search_inspections(UUID, TEXT, TEXT, DATE, DATE, INTEGER, INTEGER) FROM anon;
