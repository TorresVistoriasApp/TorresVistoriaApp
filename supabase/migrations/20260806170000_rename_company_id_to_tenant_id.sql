-- Renomeia a coluna de tenant de `company_id` para `tenant_id` em todo o schema.
--
-- Por que dá para fazer isso com segurança: no Postgres, políticas RLS, índices,
-- constraints e triggers guardam a referência de coluna pelo número do atributo,
-- não pelo nome — então todos acompanham o RENAME automaticamente. Corpos de
-- função, por outro lado, são texto: cada função que citava `company_id` precisa
-- ser recriada, e é o que a etapa 3 em diante faz.
--
-- Duas decisões que valem registro:
--
-- 1. `can_access_tenant_row` e `can_access_financial_row` mantêm o parâmetro
--    `p_company_id`. Trocar nome de parâmetro exige DROP, e essas duas funções
--    estão embutidas em ~24 políticas RLS — o DROP falharia por dependência, e
--    derrubar as políticas para renomear um parâmetro posicional (que ninguém
--    escreve, porque políticas chamam por posição) trocaria risco real por ganho
--    cosmético.
--
-- 2. `handle_new_user` passa a aceitar `tenant_id` OU `company_id` no metadata do
--    usuário. Convites já emitidos carregam `company_id` no app_metadata; exigir
--    a chave nova quebraria o cadastro de quem foi convidado antes deste deploy.

-- ---------------------------------------------------------------------------
-- 1. Colunas
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles',
    'settings',
    'inspections',
    'inspection_checklists',
    'inspection_photos',
    'inspection_comments',
    'inspection_reports',
    'inspection_paint_items',
    'inspection_types',
    'financial_entries',
    'notifications',
    'audit_logs',
    'photo_sections',
    'photo_categories',
    'company_subscriptions',
    'tenant_invitations',
    'company_branches',
    'company_teams',
    'company_team_members',
    'integration_connections',
    'company_custom_permissions'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'company_id'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I RENAME COLUMN company_id TO tenant_id', t);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Nomes de função — ALTER preserva o OID, então as políticas que já
--    referenciam estas funções (incluindo as de storage.objects) seguem válidas.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'get_user_company_id'
  ) THEN
    ALTER FUNCTION public.get_user_company_id() RENAME TO get_user_tenant_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'get_default_tenant_company_id'
  ) THEN
    ALTER FUNCTION public.get_default_tenant_company_id() RENAME TO get_default_tenant_id;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM public.profiles
  WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND is_active = true
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_user_tenant_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_tenant_id() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_default_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.companies
  WHERE deleted_at IS NULL
  ORDER BY created_at ASC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_default_tenant_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_default_tenant_id() TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Predicados usados dentro das políticas RLS (assinatura preservada)
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
  SELECT p_company_id = public.get_user_tenant_id()
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
      AND public.can_access_tenant_row(i.tenant_id, i.created_by)
  );
$$;

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
  SELECT p_company_id = public.get_user_tenant_id()
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
                AND i.tenant_id = p_company_id
                AND i.deleted_at IS NULL
                AND i.created_by = auth.uid()
            )
          )
        )
      )
    );
$$;

-- ---------------------------------------------------------------------------
-- 4. Funções de trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_inspection_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.inspection_number IS NULL OR NEW.inspection_number = 0 THEN
    PERFORM pg_advisory_xact_lock(hashtext(NEW.tenant_id::text));

    SELECT COALESCE(MAX(inspection_number), 0) + 1
      INTO NEW.inspection_number
      FROM public.inspections
      WHERE tenant_id = NEW.tenant_id;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_inspection_number() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.audit_log_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'companies' THEN
    v_tenant_id := COALESCE(NEW.id, OLD.id);
  ELSE
    v_tenant_id := COALESCE(NEW.tenant_id, OLD.tenant_id, public.get_user_tenant_id());
  END IF;

  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    created_by,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data,
    ip_address,
    user_agent
  )
  VALUES (
    v_tenant_id,
    auth.uid(),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN public.redact_audit_jsonb(to_jsonb(OLD)) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN public.redact_audit_jsonb(to_jsonb(NEW)) END,
    public.get_request_ip(),
    public.get_request_user_agent()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.audit_log_changes() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_role public.tenant_role;
  v_must_change_password BOOLEAN;
BEGIN
  IF COALESCE(NEW.raw_app_meta_data->>'is_platform_admin', 'false') = 'true' THEN
    INSERT INTO public.platform_admins (id, full_name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NEW.email
    );
    RETURN NEW;
  END IF;

  -- Aceita a chave antiga: convites emitidos antes do rename trazem company_id.
  v_tenant_id := COALESCE(
    NEW.raw_app_meta_data->>'tenant_id',
    NEW.raw_app_meta_data->>'company_id'
  )::UUID;
  v_role := public.normalize_tenant_role(NEW.raw_app_meta_data->>'role');
  v_must_change_password := COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false);

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Cadastro exige tenant_id explícito no metadata do usuário.';
  END IF;

  INSERT INTO public.profiles (
    id, tenant_id, full_name, role, email, must_change_password, is_active
  )
  VALUES (
    NEW.id,
    v_tenant_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    v_role,
    NEW.email,
    v_must_change_password,
    true
  );

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.notify_inspection_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.notifications (tenant_id, user_id, title, body, metadata)
    SELECT
      NEW.tenant_id,
      p.id,
      'Vistoria concluída',
      'Vistoria #' || NEW.inspection_number || ' (' || NEW.plate || ') foi concluída.',
      jsonb_build_object('inspection_id', NEW.id, 'type', 'inspection_completed')
    FROM public.profiles p
    WHERE p.tenant_id = NEW.tenant_id
      AND p.role = 'SUPER_ADMIN'
      AND p.deleted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_inspection_completed() FROM PUBLIC, anon, authenticated;

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
    AND it.tenant_id = NEW.tenant_id
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
      tenant_id,
      inspection_id,
      entry_type,
      description,
      amount,
      entry_date,
      source,
      created_by
    ) VALUES (
      NEW.tenant_id,
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

CREATE OR REPLACE FUNCTION public.prevent_profile_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM auth.uid() THEN
    RETURN NEW;
  END IF;

  IF public.is_super_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
     OR NEW.is_active IS DISTINCT FROM OLD.is_active
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.email IS DISTINCT FROM OLD.email
  THEN
    RAISE EXCEPTION 'Função, empresa, status e e-mail do perfil só podem ser alterados por um administrador.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_profile_self_escalation() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.validate_inspection_photo_storage_path()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.storage_path IS NULL OR btrim(NEW.storage_path) = '' THEN
    RAISE EXCEPTION 'inspection_photos.storage_path é obrigatório';
  END IF;

  IF split_part(NEW.storage_path, '/', 1) <> NEW.tenant_id::text THEN
    RAISE EXCEPTION 'storage_path deve iniciar com tenant_id da linha';
  END IF;

  IF split_part(NEW.storage_path, '/', 2) <> NEW.inspection_id::text THEN
    RAISE EXCEPTION 'storage_path deve conter inspection_id da linha';
  END IF;

  IF split_part(NEW.storage_path, '/', 3) <> NEW.category THEN
    RAISE EXCEPTION 'storage_path deve conter category da linha';
  END IF;

  IF NEW.storage_path !~ '\.webp$' THEN
    RAISE EXCEPTION 'fotos de vistoria devem usar extensão .webp';
  END IF;

  IF NEW.thumbnail_url IS NOT NULL
     AND btrim(NEW.thumbnail_url) <> ''
     AND NEW.thumbnail_url <> public.inspection_photo_thumbnail_path(NEW.storage_path) THEN
    RAISE EXCEPTION 'thumbnail_url deve seguir o padrão .../thumbs/arquivo.webp';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_inspection_report_storage_path()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.storage_path IS NULL OR btrim(NEW.storage_path) = '' THEN
    RAISE EXCEPTION 'inspection_reports.storage_path é obrigatório';
  END IF;

  IF NEW.storage_path LIKE 'pending/%' THEN
    RETURN NEW;
  END IF;

  IF split_part(NEW.storage_path, '/', 1) <> NEW.tenant_id::text THEN
    RAISE EXCEPTION 'storage_path do laudo deve iniciar com tenant_id da linha';
  END IF;

  IF split_part(NEW.storage_path, '/', 2) <> NEW.inspection_id::text THEN
    RAISE EXCEPTION 'storage_path do laudo deve conter inspection_id da linha';
  END IF;

  IF NEW.storage_path !~ '\.pdf$' THEN
    RAISE EXCEPTION 'laudos devem usar extensão .pdf';
  END IF;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. RPCs e helpers internos — parâmetro passa a ser p_tenant_id.
--    Trocar nome de parâmetro exige DROP; nenhuma destas está embutida em
--    política RLS, então o DROP é seguro.
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.company_inspection_revenue(UUID, DATE, DATE, UUID);
CREATE FUNCTION public.company_inspection_revenue(
  p_tenant_id UUID,
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
  WHERE i.tenant_id = p_tenant_id
    AND i.deleted_at IS NULL
    AND (p_start_date IS NULL OR i.inspection_date >= p_start_date)
    AND (p_end_date IS NULL OR i.inspection_date <= p_end_date)
    AND (p_inspector_id IS NULL OR i.created_by = p_inspector_id);
$$;

REVOKE ALL ON FUNCTION public.company_inspection_revenue(UUID, DATE, DATE, UUID)
  FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.company_manual_revenue(UUID, DATE, DATE);
CREATE FUNCTION public.company_manual_revenue(
  p_tenant_id UUID,
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
  WHERE f.tenant_id = p_tenant_id
    AND f.entry_type = 'RECEITA'
    AND f.deleted_at IS NULL
    AND f.inspection_id IS NULL
    AND (p_start_date IS NULL OR f.entry_date >= p_start_date)
    AND (p_end_date IS NULL OR f.entry_date <= p_end_date);
$$;

REVOKE ALL ON FUNCTION public.company_manual_revenue(UUID, DATE, DATE)
  FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.get_dashboard_stats(UUID);
CREATE FUNCTION public.get_dashboard_stats(p_tenant_id UUID)
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
  IF public.get_user_tenant_id() IS DISTINCT FROM p_tenant_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_scope_user_id := public.dashboard_inspector_scope();

  SELECT COUNT(*)::INTEGER INTO v_inspections_ytd
  FROM public.inspections i
  WHERE i.tenant_id = p_tenant_id
    AND i.deleted_at IS NULL
    AND i.inspection_date >= v_year_start
    AND (v_scope_user_id IS NULL OR i.created_by = v_scope_user_id);

  SELECT COUNT(*)::INTEGER INTO v_total_inspections
  FROM public.inspections i
  WHERE i.tenant_id = p_tenant_id
    AND i.deleted_at IS NULL
    AND (v_scope_user_id IS NULL OR i.created_by = v_scope_user_id);

  v_revenue := public.company_inspection_revenue(p_tenant_id, v_year_start, NULL, v_scope_user_id);

  IF v_scope_user_id IS NULL THEN
    v_revenue := v_revenue + public.company_manual_revenue(p_tenant_id, v_year_start, NULL);

    SELECT COALESCE(SUM(amount), 0) INTO v_expenses
    FROM public.financial_entries
    WHERE tenant_id = p_tenant_id
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
      WHERE i.tenant_id = p_tenant_id
        AND i.status = 'DRAFT'
        AND i.deleted_at IS NULL
        AND (v_scope_user_id IS NULL OR i.created_by = v_scope_user_id)
    ),
    'completedInspections', (
      SELECT COUNT(*) FROM public.inspections i
      WHERE i.tenant_id = p_tenant_id
        AND i.status = 'COMPLETED'
        AND i.deleted_at IS NULL
        AND (v_scope_user_id IS NULL OR i.created_by = v_scope_user_id)
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_dashboard_stats(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats(UUID) TO authenticated;

DROP FUNCTION IF EXISTS public.get_monthly_inspections(UUID, INTEGER);
CREATE FUNCTION public.get_monthly_inspections(
  p_tenant_id UUID,
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
  IF public.get_user_tenant_id() IS DISTINCT FROM p_tenant_id THEN
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
    WHERE i.tenant_id = p_tenant_id
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
    WHERE i.tenant_id = p_tenant_id
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
    WHERE f.tenant_id = p_tenant_id
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

REVOKE ALL ON FUNCTION public.get_monthly_inspections(UUID, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_monthly_inspections(UUID, INTEGER) TO authenticated;

DROP FUNCTION IF EXISTS public.get_inspections_by_brand(UUID);
CREATE FUNCTION public.get_inspections_by_brand(p_tenant_id UUID)
RETURNS TABLE (brand TEXT, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_scope_user_id UUID;
BEGIN
  IF public.get_user_tenant_id() IS DISTINCT FROM p_tenant_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_scope_user_id := public.dashboard_inspector_scope();

  RETURN QUERY
  SELECT i.brand, COUNT(*)::BIGINT
  FROM public.inspections i
  WHERE i.tenant_id = p_tenant_id
    AND i.deleted_at IS NULL
    AND (v_scope_user_id IS NULL OR i.created_by = v_scope_user_id)
  GROUP BY i.brand
  ORDER BY count DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_inspections_by_brand(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_inspections_by_brand(UUID) TO authenticated;

DROP FUNCTION IF EXISTS public.get_financial_summary(UUID, DATE, DATE);
CREATE FUNCTION public.get_financial_summary(
  p_tenant_id UUID,
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
  IF public.get_user_tenant_id() IS DISTINCT FROM p_tenant_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_scope_user_id := public.dashboard_inspector_scope();

  IF v_scope_user_id IS NULL THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Acesso negado';
    END IF;

    v_revenue := public.company_inspection_revenue(p_tenant_id, p_start_date, p_end_date, NULL)
      + public.company_manual_revenue(p_tenant_id, p_start_date, p_end_date);

    SELECT
      COALESCE(SUM(amount) FILTER (WHERE entry_type = 'DESPESA'), 0),
      COALESCE(SUM(amount) FILTER (WHERE entry_type = 'CUSTO'), 0)
    INTO v_expenses, v_costs
    FROM public.financial_entries
    WHERE tenant_id = p_tenant_id
      AND entry_date BETWEEN p_start_date AND p_end_date
      AND deleted_at IS NULL;
  ELSE
    v_revenue := public.company_inspection_revenue(
      p_tenant_id,
      p_start_date,
      p_end_date,
      v_scope_user_id
    );

    SELECT COALESCE(SUM(fe.amount), 0)
    INTO v_manual_revenue
    FROM public.financial_entries fe
    WHERE fe.tenant_id = p_tenant_id
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

REVOKE ALL ON FUNCTION public.get_financial_summary(UUID, DATE, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_financial_summary(UUID, DATE, DATE) TO authenticated;

DROP FUNCTION IF EXISTS public.search_inspections(UUID, TEXT, TEXT, DATE, DATE, INTEGER, INTEGER);
CREATE FUNCTION public.search_inspections(
  p_tenant_id UUID,
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
  IF public.get_user_tenant_id() IS DISTINCT FROM p_tenant_id THEN
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
    WHERE i.tenant_id = p_tenant_id
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

REVOKE ALL ON FUNCTION public.search_inspections(UUID, TEXT, TEXT, DATE, DATE, INTEGER, INTEGER)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_inspections(UUID, TEXT, TEXT, DATE, DATE, INTEGER, INTEGER)
  TO authenticated;

-- ---------------------------------------------------------------------------
-- 6. Demais RPCs
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cleanup_expired_inspection_drafts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed INTEGER := 0;
  v_tenant_id UUID;
  v_scope_user_id UUID;
BEGIN
  v_tenant_id := public.get_user_tenant_id();
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_scope_user_id := public.dashboard_inspector_scope();

  WITH expired AS (
    DELETE FROM public.inspections
    WHERE status = 'DRAFT'
      AND draft_expires_at IS NOT NULL
      AND draft_expires_at < NOW()
      AND deleted_at IS NULL
      AND tenant_id = v_tenant_id
      AND (v_scope_user_id IS NULL OR created_by = v_scope_user_id)
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO removed FROM expired;

  RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_expired_inspection_drafts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_inspection_drafts() TO authenticated;

CREATE OR REPLACE FUNCTION public.record_audit_event(
  p_action TEXT,
  p_entity_type TEXT DEFAULT 'app',
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_tenant_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticação necessária';
  END IF;

  IF p_action NOT IN ('LOGIN', 'LOGOUT', 'EXPORT_PDF', 'EXPORT_EXCEL') THEN
    RAISE EXCEPTION 'Ação de auditoria inválida: %', p_action;
  END IF;

  v_tenant_id := public.get_user_tenant_id();

  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    created_by,
    action,
    entity_type,
    entity_id,
    new_data,
    ip_address,
    user_agent
  )
  VALUES (
    v_tenant_id,
    auth.uid(),
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_metadata,
    public.get_request_ip(),
    public.get_request_user_agent()
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_audit_event(TEXT, TEXT, UUID, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_audit_event(TEXT, TEXT, UUID, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION public.anonymize_user_account(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  IF auth.uid() <> p_user_id AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT tenant_id INTO v_tenant_id
  FROM public.profiles
  WHERE id = p_user_id AND deleted_at IS NULL;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Perfil não encontrado';
  END IF;

  UPDATE public.profiles
  SET
    full_name = 'Usuário excluído',
    avatar_url = NULL,
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO public.audit_logs (user_id, tenant_id, action, entity_type, entity_id, new_data)
  VALUES (
    p_user_id,
    v_tenant_id,
    'ACCOUNT_ANONYMIZED',
    'profiles',
    p_user_id,
    jsonb_build_object('anonymized_at', NOW())
  );
END;
$$;

REVOKE ALL ON FUNCTION public.anonymize_user_account(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.anonymize_user_account(UUID) TO authenticated;

DROP FUNCTION IF EXISTS public.get_migration_health_report(UUID);
CREATE FUNCTION public.get_migration_health_report(p_tenant_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_result JSONB;
BEGIN
  v_tenant_id := COALESCE(p_tenant_id, public.get_user_tenant_id());

  IF NOT public.is_super_admin()
     OR (v_tenant_id IS NOT NULL AND public.get_user_tenant_id() IS DISTINCT FROM v_tenant_id)
  THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT jsonb_build_object(
    'tenantId', v_tenant_id,
    'generatedAt', NOW(),
    'orphanAuditLogs', (
      SELECT COUNT(*)::INTEGER FROM public.audit_logs
      WHERE deleted_at IS NULL
        AND tenant_id IS NULL
    ),
    'inspectionsMissingCreatedBy', (
      SELECT COUNT(*)::INTEGER FROM public.inspections
      WHERE deleted_at IS NULL
        AND created_by IS NULL
        AND (v_tenant_id IS NULL OR tenant_id = v_tenant_id)
    ),
    'photosNonCanonicalPath', (
      SELECT COUNT(*)::INTEGER FROM public.inspection_photos p
      WHERE p.deleted_at IS NULL
        AND (v_tenant_id IS NULL OR p.tenant_id = v_tenant_id)
        AND split_part(p.storage_path, '/', 1) <> p.tenant_id::text
    ),
    'reportsNonCanonicalPath', (
      SELECT COUNT(*)::INTEGER FROM public.inspection_reports r
      WHERE r.deleted_at IS NULL
        AND r.storage_path NOT LIKE 'pending/%'
        AND (v_tenant_id IS NULL OR r.tenant_id = v_tenant_id)
        AND split_part(r.storage_path, '/', 1) <> r.tenant_id::text
    ),
    'pendingStorageMigrations', (
      SELECT COUNT(*)::INTEGER FROM public.legacy_storage_path_map
      WHERE migrated_at IS NULL
    ),
    'completedStorageMigrations', (
      SELECT COUNT(*)::INTEGER FROM public.legacy_storage_path_map
      WHERE migrated_at IS NOT NULL
    ),
    'profilesWithoutTenant', (
      SELECT COUNT(*)::INTEGER FROM public.profiles
      WHERE deleted_at IS NULL AND tenant_id IS NULL
    ),
    'isHealthy', (
      SELECT NOT EXISTS (
        SELECT 1 FROM public.inspections i
        WHERE i.deleted_at IS NULL
          AND i.created_by IS NULL
          AND (v_tenant_id IS NULL OR i.tenant_id = v_tenant_id)
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.inspection_photos p
        WHERE p.deleted_at IS NULL
          AND (v_tenant_id IS NULL OR p.tenant_id = v_tenant_id)
          AND split_part(p.storage_path, '/', 1) <> p.tenant_id::text
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.legacy_storage_path_map
        WHERE migrated_at IS NULL
      )
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_migration_health_report(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_migration_health_report(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 7. Índices e constraints — o rename de coluna não muda o nome do objeto,
--    e um índice chamado `..._company_id` sobre `tenant_id` mente para quem lê.
-- ---------------------------------------------------------------------------
ALTER INDEX IF EXISTS public.idx_profiles_company_id RENAME TO idx_profiles_tenant_id;
ALTER INDEX IF EXISTS public.idx_profiles_company_active RENAME TO idx_profiles_tenant_active;
ALTER INDEX IF EXISTS public.idx_profiles_company_status RENAME TO idx_profiles_tenant_status;
ALTER INDEX IF EXISTS public.idx_inspections_company_id RENAME TO idx_inspections_tenant_id;
ALTER INDEX IF EXISTS public.idx_inspections_company_created_by
  RENAME TO idx_inspections_tenant_created_by;
ALTER INDEX IF EXISTS public.idx_inspection_types_company_id
  RENAME TO idx_inspection_types_tenant_id;
ALTER INDEX IF EXISTS public.idx_inspection_paint_items_company_id
  RENAME TO idx_inspection_paint_items_tenant_id;
ALTER INDEX IF EXISTS public.idx_inspection_photos_company_created_by
  RENAME TO idx_inspection_photos_tenant_created_by;
ALTER INDEX IF EXISTS public.idx_financial_company_date RENAME TO idx_financial_tenant_date;
ALTER INDEX IF EXISTS public.idx_financial_entries_company_created_by
  RENAME TO idx_financial_entries_tenant_created_by;
ALTER INDEX IF EXISTS public.idx_audit_logs_company_created RENAME TO idx_audit_logs_tenant_created;
ALTER INDEX IF EXISTS public.idx_audit_logs_company_action_created
  RENAME TO idx_audit_logs_tenant_action_created;
ALTER INDEX IF EXISTS public.idx_company_branches_company RENAME TO idx_company_branches_tenant;
ALTER INDEX IF EXISTS public.idx_company_teams_company RENAME TO idx_company_teams_tenant;
ALTER INDEX IF EXISTS public.idx_tenant_invitations_company_status
  RENAME TO idx_tenant_invitations_tenant_status;

-- Mapeamento explícito: as tabelas continuam chamadas `company_*`, então só o
-- trecho que descreve a coluna muda de nome.
-- O loop guardado existe porque ALTER TABLE ... RENAME CONSTRAINT não aceita
-- IF EXISTS, e um nome ausente abortaria a migration inteira.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT *
    FROM (
      VALUES
        ('inspection_types', 'inspection_types_name_company_unique', 'inspection_types_name_tenant_unique'),
        ('company_subscriptions', 'company_subscriptions_company_unique', 'company_subscriptions_tenant_unique'),
        ('company_branches', 'company_branches_company_code_unique', 'company_branches_tenant_code_unique'),
        ('integration_connections', 'integration_connections_company_provider_unique', 'integration_connections_tenant_provider_unique')
    ) AS v(table_name, old_name, new_name)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public' AND c.conname = r.old_name
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I RENAME CONSTRAINT %I TO %I',
        r.table_name,
        r.old_name,
        r.new_name
      );
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 8. Documentação da coluna
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'settings', 'inspections', 'inspection_checklists', 'inspection_photos',
    'inspection_comments', 'inspection_reports', 'inspection_paint_items', 'inspection_types',
    'financial_entries', 'notifications', 'audit_logs', 'photo_sections', 'photo_categories',
    'company_subscriptions', 'tenant_invitations', 'company_branches', 'company_teams',
    'company_team_members', 'integration_connections', 'company_custom_permissions'
  ]
  LOOP
    EXECUTE format(
      'COMMENT ON COLUMN public.%I.tenant_id IS %L',
      t,
      'Tenant proprietário da linha (FK para public.companies). Toda política RLS resolve por esta coluna.'
    );
  END LOOP;
END $$;
