-- ETAPA 5 — ROW LEVEL SECURITY (escopo por company_id + created_by)
--
-- Regra principal (nunca confiar no frontend):
--   SUPER_ADMIN → todos os registros da própria empresa (company_id = get_user_company_id())
--   INSPECTOR   → apenas registros criados por ele (created_by = auth.uid())
--
-- Substitui o escopo antigo baseado em inspector_id / can_access_inspection_row(inspector_id).

-- ---------------------------------------------------------------------------
-- 1. Helpers centralizados
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_access_tenant_row(
  p_company_id UUID,
  p_created_by UUID
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
        AND p_created_by IS NOT NULL
        AND p_created_by = auth.uid()
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.can_access_inspection_row(p_inspection_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.inspections i
    WHERE i.id = p_inspection_id
      AND i.deleted_at IS NULL
      AND public.can_access_tenant_row(i.company_id, i.created_by)
  );
$$;

REVOKE ALL ON FUNCTION public.can_access_tenant_row(UUID, UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_access_inspection_row(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_tenant_row(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_inspection_row(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. RPCs SECURITY DEFINER — alinhar filtro inspector_id → created_by
-- ---------------------------------------------------------------------------
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
    AND (p_inspector_id IS NULL OR i.created_by = p_inspector_id);
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
DECLARE
  v_scope_user_id UUID;
BEGIN
  IF public.get_user_company_id() IS DISTINCT FROM p_company_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_scope_user_id := public.dashboard_inspector_scope();

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
      AND (v_scope_user_id IS NULL OR i.created_by = v_scope_user_id)
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

CREATE OR REPLACE FUNCTION public.cleanup_expired_inspection_drafts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed INTEGER := 0;
  v_company_id UUID;
  v_scope_user_id UUID;
BEGIN
  v_company_id := public.get_user_company_id();
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_scope_user_id := public.dashboard_inspector_scope();

  WITH expired AS (
    DELETE FROM public.inspections
    WHERE status = 'DRAFT'
      AND draft_expires_at IS NOT NULL
      AND draft_expires_at < NOW()
      AND deleted_at IS NULL
      AND company_id = v_company_id
      AND (v_scope_user_id IS NULL OR created_by = v_scope_user_id)
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO removed FROM expired;

  RETURN removed;
END;
$$;

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
  v_scope_user_id UUID;
  v_year_start DATE := date_trunc('year', CURRENT_DATE)::DATE;
BEGIN
  IF public.get_user_company_id() IS DISTINCT FROM p_company_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_scope_user_id := public.dashboard_inspector_scope();

  SELECT COUNT(*)::INTEGER INTO v_inspections_ytd
  FROM public.inspections i
  WHERE i.company_id = p_company_id
    AND i.deleted_at IS NULL
    AND i.inspection_date >= v_year_start
    AND (v_scope_user_id IS NULL OR i.created_by = v_scope_user_id);

  SELECT COUNT(*)::INTEGER INTO v_total_inspections
  FROM public.inspections i
  WHERE i.company_id = p_company_id
    AND i.deleted_at IS NULL
    AND (v_scope_user_id IS NULL OR i.created_by = v_scope_user_id);

  v_revenue := public.company_inspection_revenue(p_company_id, v_year_start, NULL, v_scope_user_id);

  IF v_scope_user_id IS NULL THEN
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
        AND (v_scope_user_id IS NULL OR i.created_by = v_scope_user_id)
    ),
    'completedInspections', (
      SELECT COUNT(*) FROM public.inspections i
      WHERE i.company_id = p_company_id
        AND i.status = 'COMPLETED'
        AND i.deleted_at IS NULL
        AND (v_scope_user_id IS NULL OR i.created_by = v_scope_user_id)
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
  v_scope_user_id UUID;
BEGIN
  IF public.get_user_company_id() IS DISTINCT FROM p_company_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_scope_user_id := public.dashboard_inspector_scope();

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
      AND (v_scope_user_id IS NULL OR i.created_by = v_scope_user_id)
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
      AND (v_scope_user_id IS NULL OR i.created_by = v_scope_user_id)
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
      AND v_scope_user_id IS NULL
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
  v_scope_user_id UUID;
BEGIN
  IF public.get_user_company_id() IS DISTINCT FROM p_company_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_scope_user_id := public.dashboard_inspector_scope();

  RETURN QUERY
  SELECT i.brand, COUNT(*)::BIGINT
  FROM public.inspections i
  WHERE i.company_id = p_company_id
    AND i.deleted_at IS NULL
    AND (v_scope_user_id IS NULL OR i.created_by = v_scope_user_id)
  GROUP BY i.brand
  ORDER BY count DESC;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. inspections — policies separadas por operação
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS inspections_select ON public.inspections;
DROP POLICY IF EXISTS inspections_insert ON public.inspections;
DROP POLICY IF EXISTS inspections_update ON public.inspections;
DROP POLICY IF EXISTS inspections_delete ON public.inspections;

CREATE POLICY inspections_select ON public.inspections FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    AND deleted_at IS NULL
    AND public.can_access_tenant_row(company_id, created_by)
  );

CREATE POLICY inspections_insert ON public.inspections FOR INSERT
  WITH CHECK (
    company_id = public.get_user_company_id()
    AND (
      public.is_super_admin()
      OR (public.is_inspector() AND inspector_id = auth.uid())
    )
  );

CREATE POLICY inspections_update ON public.inspections FOR UPDATE
  USING (
    company_id = public.get_user_company_id()
    AND deleted_at IS NULL
    AND public.can_access_tenant_row(company_id, created_by)
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    AND public.can_access_tenant_row(company_id, created_by)
  );

CREATE POLICY inspections_delete ON public.inspections FOR DELETE
  USING (
    company_id = public.get_user_company_id()
    AND deleted_at IS NULL
    AND public.can_access_tenant_row(company_id, created_by)
  );

-- ---------------------------------------------------------------------------
-- 4. Tabelas filhas — escopo por created_by da própria linha
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'inspection_checklists',
    'inspection_photos',
    'inspection_reports',
    'inspection_paint_items'
  ];
  prefix TEXT;
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    prefix := CASE t
      WHEN 'inspection_checklists' THEN 'checklists'
      WHEN 'inspection_photos' THEN 'photos'
      WHEN 'inspection_reports' THEN 'reports'
      WHEN 'inspection_paint_items' THEN 'paint_items'
    END;

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', prefix || '_select', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', prefix || '_insert', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', prefix || '_update', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', prefix || '_delete', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_tenant', t);

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT
         USING (
           company_id = public.get_user_company_id()
           AND deleted_at IS NULL
           AND public.can_access_tenant_row(company_id, created_by)
         )',
      prefix || '_select', t
    );

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT
         WITH CHECK (
           company_id = public.get_user_company_id()
           AND public.can_access_inspection_row(inspection_id)
         )',
      prefix || '_insert', t
    );

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE
         USING (
           company_id = public.get_user_company_id()
           AND deleted_at IS NULL
           AND public.can_access_tenant_row(company_id, created_by)
         )
         WITH CHECK (
           company_id = public.get_user_company_id()
           AND public.can_access_tenant_row(company_id, created_by)
         )',
      prefix || '_update', t
    );

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE
         USING (
           company_id = public.get_user_company_id()
           AND public.can_access_tenant_row(company_id, created_by)
         )',
      prefix || '_delete', t
    );
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. inspection_comments — substituir policy única de super admin
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS comments_admin ON public.inspection_comments;

CREATE POLICY comments_select ON public.inspection_comments FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    AND deleted_at IS NULL
    AND public.can_access_tenant_row(company_id, created_by)
  );

CREATE POLICY comments_insert ON public.inspection_comments FOR INSERT
  WITH CHECK (
    company_id = public.get_user_company_id()
    AND public.can_access_inspection_row(inspection_id)
    AND author_id = auth.uid()
  );

CREATE POLICY comments_update ON public.inspection_comments FOR UPDATE
  USING (
    company_id = public.get_user_company_id()
    AND deleted_at IS NULL
    AND public.can_access_tenant_row(company_id, created_by)
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    AND public.can_access_tenant_row(company_id, created_by)
  );

CREATE POLICY comments_delete ON public.inspection_comments FOR DELETE
  USING (
    company_id = public.get_user_company_id()
    AND public.can_access_tenant_row(company_id, created_by)
  );

-- ---------------------------------------------------------------------------
-- 6. financial_entries — admin CRUD; inspector só SELECT dos próprios
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS financial_admin ON public.financial_entries;

CREATE POLICY financial_select ON public.financial_entries FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    AND deleted_at IS NULL
    AND public.can_access_tenant_row(company_id, created_by)
  );

CREATE POLICY financial_insert ON public.financial_entries FOR INSERT
  WITH CHECK (
    company_id = public.get_user_company_id()
    AND public.is_super_admin()
  );

CREATE POLICY financial_update ON public.financial_entries FOR UPDATE
  USING (
    company_id = public.get_user_company_id()
    AND deleted_at IS NULL
    AND public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    AND public.is_super_admin()
  );

CREATE POLICY financial_delete ON public.financial_entries FOR DELETE
  USING (
    company_id = public.get_user_company_id()
    AND public.is_super_admin()
  );

-- ---------------------------------------------------------------------------
-- 7. Storage inspection-photos — escopo por created_by da foto
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS storage_photos_select ON storage.objects;
CREATE POLICY storage_photos_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'inspection-photos'
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspection_photos p
        WHERE p.storage_path = storage.objects.name
          AND p.company_id = public.get_user_company_id()
          AND p.created_by = auth.uid()
          AND p.deleted_at IS NULL
      )
    )
  );

DROP POLICY IF EXISTS storage_photos_insert ON storage.objects;
CREATE POLICY storage_photos_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'inspection-photos'
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspections i
        WHERE i.id::text = (storage.foldername(name))[2]
          AND i.company_id = public.get_user_company_id()
          AND i.deleted_at IS NULL
          AND public.can_access_tenant_row(i.company_id, i.created_by)
      )
    )
  );

DROP POLICY IF EXISTS storage_photos_update ON storage.objects;
CREATE POLICY storage_photos_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'inspection-photos'
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspection_photos p
        WHERE p.storage_path = storage.objects.name
          AND p.company_id = public.get_user_company_id()
          AND p.created_by = auth.uid()
          AND p.deleted_at IS NULL
      )
    )
  )
  WITH CHECK (
    bucket_id = 'inspection-photos'
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
  );

DROP POLICY IF EXISTS storage_photos_delete ON storage.objects;
CREATE POLICY storage_photos_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'inspection-photos'
    AND (storage.foldername(name))[1] = public.get_user_company_id()::text
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.inspection_photos p
        WHERE p.storage_path = storage.objects.name
          AND p.company_id = public.get_user_company_id()
          AND p.created_by = auth.uid()
          AND p.deleted_at IS NULL
      )
    )
  );
