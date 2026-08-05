-- Fecha lacunas apontadas na revisão de arquitetura:
--   1. `notifications` isolava só por usuário, não por tenant.
--   2. Tabelas SaaS reservadas ficaram fora do padrão de soft delete.
--   3. Não havia forma de ler o histórico de uma linha sem varrer audit_logs.
--   4. FKs sem índice em tabelas que já filtram por elas.
--
-- Retrofit de trigger de soft delete nas tabelas restantes NÃO entra aqui de
-- propósito: `soft_delete_row` transforma DELETE em UPDATE e retorna NULL, o que
-- muda o resultado de `DELETE ... RETURNING` e o comportamento de constraints
-- UNIQUE (a linha continua existindo). Aplicar isso em `inspection_photos` e
-- `inspection_reports`, que hoje contam com DELETE físico no fluxo de reenvio de
-- arquivo, exige revisar esses fluxos primeiro.

-- ---------------------------------------------------------------------------
-- 1. notifications: isolar por tenant, não só por usuário
-- ---------------------------------------------------------------------------
-- Um usuário só deve ver notificações da empresa em que está ativo. Sem o filtro
-- de tenant, quem troca de empresa continuaria vendo notificações da anterior.
DROP POLICY IF EXISTS notifications_own ON public.notifications;

CREATE POLICY notifications_select ON public.notifications FOR SELECT
  USING (
    user_id = auth.uid()
    AND tenant_id = public.get_user_tenant_id()
    AND deleted_at IS NULL
  );

CREATE POLICY notifications_update ON public.notifications FOR UPDATE
  USING (
    user_id = auth.uid()
    AND tenant_id = public.get_user_tenant_id()
    AND deleted_at IS NULL
  )
  WITH CHECK (
    user_id = auth.uid()
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY notifications_delete ON public.notifications FOR DELETE
  USING (
    user_id = auth.uid()
    AND tenant_id = public.get_user_tenant_id()
  );

-- Sem policy de INSERT para `authenticated`: notificação é criada por trigger
-- (`notify_inspection_completed`), que roda como SECURITY DEFINER. Deixar o
-- cliente inserir permitiria fabricar notificação para outro usuário.

CREATE INDEX IF NOT EXISTS idx_notifications_tenant_user
  ON public.notifications(tenant_id, user_id, read_at)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- 2. Soft delete nas tabelas SaaS reservadas
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'company_subscriptions',
    'tenant_invitations',
    'company_team_members',
    'integration_connections',
    'company_custom_permissions'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ', t);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_by UUID', t);
    END IF;
  END LOOP;
END $$;

-- As policies de leitura dessas tabelas passam a respeitar o soft delete.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT *
    FROM (
      VALUES
        ('company_subscriptions', 'company_subscriptions_select'),
        ('tenant_invitations', 'tenant_invitations_select'),
        ('company_team_members', 'company_team_members_select'),
        ('integration_connections', 'integration_connections_select'),
        ('company_custom_permissions', 'company_custom_permissions_select')
    ) AS v(table_name, policy_name)
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = r.table_name AND policyname = r.policy_name
    ) THEN
      EXECUTE format('DROP POLICY %I ON public.%I', r.policy_name, r.table_name);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT USING (tenant_id = public.get_user_tenant_id() AND deleted_at IS NULL AND public.is_super_admin())',
        r.policy_name,
        r.table_name
      );
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Histórico de uma linha
-- ---------------------------------------------------------------------------
-- Não existe tabela de versões separada, e criar uma duplicaria o audit trail:
-- `audit_logs` já guarda old_data/new_data a cada mudança, o que permite
-- reconstruir qualquer estado anterior. O que faltava era ler isso por entidade
-- sem dar SELECT amplo em audit_logs.
CREATE OR REPLACE FUNCTION public.get_entity_history(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  version BIGINT,
  action TEXT,
  changed_at TIMESTAMPTZ,
  changed_by UUID,
  changed_by_name TEXT,
  changed_fields TEXT[],
  old_data JSONB,
  new_data JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  v_tenant_id := public.get_user_tenant_id();

  IF v_tenant_id IS NULL OR NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 500 THEN
    RAISE EXCEPTION 'Limite inválido: %', p_limit;
  END IF;

  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY al.created_at)::BIGINT,
    al.action,
    al.created_at,
    al.user_id,
    p.full_name,
    ARRAY(
      SELECT key
      FROM jsonb_each(COALESCE(al.new_data, '{}'::jsonb)) AS n(key, value)
      WHERE al.old_data IS NULL OR al.old_data->key IS DISTINCT FROM n.value
      ORDER BY key
    ),
    al.old_data,
    al.new_data
  FROM public.audit_logs al
  LEFT JOIN public.profiles p ON p.id = al.user_id
  WHERE al.tenant_id = v_tenant_id
    AND al.entity_type = p_entity_type
    AND al.entity_id = p_entity_id
    AND al.deleted_at IS NULL
  ORDER BY al.created_at
  LIMIT p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.get_entity_history(TEXT, UUID, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_entity_history(TEXT, UUID, INTEGER) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON public.audit_logs(tenant_id, entity_type, entity_id, created_at)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- 4. FKs sem índice
-- ---------------------------------------------------------------------------
-- Sem índice na FK, todo DELETE/UPDATE no lado referenciado faz seq scan aqui.
CREATE INDEX IF NOT EXISTS idx_inspection_checklists_tenant
  ON public.inspection_checklists(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inspection_comments_tenant
  ON public.inspection_comments(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inspection_comments_inspection
  ON public.inspection_comments(inspection_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inspection_reports_tenant
  ON public.inspection_reports(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inspection_reports_inspection
  ON public.inspection_reports(inspection_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inspection_photos_tenant
  ON public.inspection_photos(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_settings_tenant
  ON public.settings(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_financial_entries_inspection
  ON public.financial_entries(inspection_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_user
  ON public.audit_logs(user_id, created_at DESC) WHERE deleted_at IS NULL;
