-- Fase 2: fecha vazamentos de tenant e de papel em RPCs e policies.
--
-- As funções abaixo são SECURITY DEFINER e portanto ignoram RLS. Quando recebem
-- p_company_id como parâmetro sem validar o chamador, ou quando não reproduzem o
-- escopo das policies, elas viram um caminho paralelo para ler dados que a RLS
-- deveria estar protegendo.

-- 1. search_inspections passa a respeitar o escopo do vistoriador.
--    A policy inspections_select limita VISTORIADOR a inspector_id = auth.uid(),
--    mas esta função filtrava apenas por empresa e devolvia a carteira inteira.
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
DECLARE
  v_inspector_id UUID;
BEGIN
  IF public.get_user_company_id() IS DISTINCT FROM p_company_id AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_inspector_id := public.dashboard_inspector_scope();

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
      AND (v_inspector_id IS NULL OR i.inspector_id = v_inspector_id)
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

-- 2. get_financial_summary exige super admin.
--    A permissão financial.manage é de admin e a RLS de financial_entries já
--    restringe a tabela; só o resumo agregado continuava aberto ao tenant todo.
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
  IF NOT public.is_super_admin() OR public.get_user_company_id() IS DISTINCT FROM p_company_id THEN
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

-- 3. As auxiliares de receita não validam o chamador e aceitam qualquer
--    p_company_id. Elas só são usadas internamente pelas funções acima, que já
--    rodam como owner, então o acesso direto via PostgREST pode ser revogado.
REVOKE ALL ON FUNCTION public.company_inspection_revenue(UUID, DATE, DATE, UUID)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.company_manual_revenue(UUID, DATE, DATE)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.dashboard_inspector_scope()
  FROM PUBLIC, anon, authenticated;

-- 4. settings: leitura para o tenant, escrita só para super admin.
--    A policy FOR ALL deixava qualquer vistoriador alterar rodapé legal,
--    assinatura e marca d'água que saem impressos no laudo.
DROP POLICY IF EXISTS settings_tenant ON public.settings;

CREATE POLICY settings_select ON public.settings FOR SELECT
  USING (company_id = public.get_user_company_id() AND deleted_at IS NULL);

CREATE POLICY settings_admin_insert ON public.settings FOR INSERT
  WITH CHECK (company_id = public.get_user_company_id() AND public.is_super_admin());

CREATE POLICY settings_admin_update ON public.settings FOR UPDATE
  USING (
    company_id = public.get_user_company_id()
    AND public.is_super_admin()
    AND deleted_at IS NULL
  )
  WITH CHECK (company_id = public.get_user_company_id() AND public.is_super_admin());

CREATE POLICY settings_admin_delete ON public.settings FOR DELETE
  USING (company_id = public.get_user_company_id() AND public.is_super_admin());

-- 5. validate_report sai do alcance do anon.
--    O RPC devolve placa, marca, modelo e parecer. A edge function
--    validate-report é a superfície pública e faz a própria consulta com o
--    service client, devolvendo só número, data, empresa e integridade — então
--    nada depende deste grant.
REVOKE ALL ON FUNCTION public.validate_report(TEXT) FROM anon;

-- 6. cleanup_expired_inspection_drafts passa a respeitar o escopo do chamador.
--    Antes fazia DELETE físico global, em todas as empresas, para qualquer
--    usuário autenticado.
CREATE OR REPLACE FUNCTION public.cleanup_expired_inspection_drafts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed INTEGER := 0;
  v_company_id UUID;
  v_inspector_id UUID;
BEGIN
  v_company_id := public.get_user_company_id();
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_inspector_id := public.dashboard_inspector_scope();

  WITH expired AS (
    DELETE FROM public.inspections
    WHERE status = 'DRAFT'
      AND draft_expires_at IS NOT NULL
      AND draft_expires_at < NOW()
      AND deleted_at IS NULL
      AND company_id = v_company_id
      AND (v_inspector_id IS NULL OR inspector_id = v_inspector_id)
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO removed FROM expired;

  RETURN removed;
END;
$$;
