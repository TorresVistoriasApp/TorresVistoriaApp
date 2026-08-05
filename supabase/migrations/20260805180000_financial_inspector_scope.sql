-- ETAPA 11 — FINANCEIRO: escopo empresa (SUPER_ADMIN) vs pessoal (INSPECTOR)
--
-- INSPECTOR vê receitas das próprias vistorias (created_by) e lançamentos
-- vinculados a essas vistorias, mesmo quando created_by do lançamento é outro usuário
-- (ex.: sync automático que usa inspector_id).

-- ---------------------------------------------------------------------------
-- 1. Permissão financial.read.own para INSPECTOR
-- ---------------------------------------------------------------------------
INSERT INTO public.permissions (code, name, description) VALUES
  (
    'financial.read.own',
    'Ver próprio financeiro',
    'Visualizar receitas e lançamentos das próprias vistorias'
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code = 'financial.read.own'
WHERE r.code = 'INSPECTOR'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Helper de escopo para financial_entries
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_access_financial_row(
  p_company_id UUID,
  p_created_by UUID,
  p_inspection_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_company_id = public.get_user_company_id()
    AND (
      public.is_super_admin()
      OR (
        public.is_inspector()
        AND (
          p_created_by = auth.uid()
          OR (
            p_inspection_id IS NOT NULL
            AND EXISTS (
              SELECT 1
              FROM public.inspections i
              WHERE i.id = p_inspection_id
                AND i.company_id = p_company_id
                AND i.deleted_at IS NULL
                AND i.created_by = auth.uid()
            )
          )
        )
      )
    );
$$;

REVOKE ALL ON FUNCTION public.can_access_financial_row(UUID, UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_financial_row(UUID, UUID, UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. RLS financial_entries — SELECT alinhado às vistorias do inspector
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS financial_select ON public.financial_entries;

CREATE POLICY financial_select ON public.financial_entries FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    AND deleted_at IS NULL
    AND public.can_access_financial_row(company_id, created_by, inspection_id)
  );

-- ---------------------------------------------------------------------------
-- 4. get_financial_summary — admin vê empresa; inspector vê escopo pessoal
-- ---------------------------------------------------------------------------
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
  v_scope_user_id UUID;
  v_manual_revenue NUMERIC;
BEGIN
  IF public.get_user_company_id() IS DISTINCT FROM p_company_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_scope_user_id := public.dashboard_inspector_scope();

  IF v_scope_user_id IS NULL THEN
    IF NOT public.is_super_admin() THEN
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
  ELSE
    v_revenue := public.company_inspection_revenue(
      p_company_id,
      p_start_date,
      p_end_date,
      v_scope_user_id
    );

    SELECT COALESCE(SUM(fe.amount), 0)
    INTO v_manual_revenue
    FROM public.financial_entries fe
    WHERE fe.company_id = p_company_id
      AND fe.entry_type = 'RECEITA'
      AND fe.deleted_at IS NULL
      AND fe.inspection_id IS NULL
      AND fe.created_by = v_scope_user_id
      AND fe.entry_date BETWEEN p_start_date AND p_end_date;

    v_revenue := v_revenue + v_manual_revenue;
    v_expenses := 0;
    v_costs := 0;
  END IF;

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
