-- ETAPA 17 — PREPARAÇÃO PARA O FUTURO (SaaS)
--
-- Tabelas reservadas para billing, convites, filiais, times, integrações e
-- permissões customizadas. Sem UI nem services ativos ainda — apenas schema +
-- RLS alinhado ao isolamento multi-tenant existente.

-- ---------------------------------------------------------------------------
-- 1. Feature flags opcionais por tenant (override de plano)
-- ---------------------------------------------------------------------------
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS feature_flags JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.companies.feature_flags IS
  'Overrides de features SaaS por tenant (ex.: beta). Plano base em subscription_plan.';

-- ---------------------------------------------------------------------------
-- 2. Assinaturas recorrentes (gateway externo futuro)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
  external_provider TEXT,
  external_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  CONSTRAINT company_subscriptions_plan_code_check
    CHECK (plan_code IN ('starter', 'professional', 'enterprise')),
  CONSTRAINT company_subscriptions_company_unique UNIQUE (company_id)
);

COMMENT ON TABLE public.company_subscriptions IS
  'Reservado: cobrança recorrente SaaS (Stripe/gateway). Plano efetivo hoje em companies.subscription_plan.';

-- ---------------------------------------------------------------------------
-- 3. Convites por e-mail (fluxo assíncrono futuro)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenant_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  token_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tenant_invitations_token_hash_unique UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS idx_tenant_invitations_company_status
  ON public.tenant_invitations(company_id, status);

COMMENT ON TABLE public.tenant_invitations IS
  'Reservado: convites por link/e-mail. Hoje invite-user cria usuário diretamente.';

-- ---------------------------------------------------------------------------
-- 4. Filiais e times
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  is_headquarters BOOLEAN NOT NULL DEFAULT false,
  address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_by UUID REFERENCES public.profiles(id),
  CONSTRAINT company_branches_company_code_unique UNIQUE (company_id, code)
);

CREATE TABLE IF NOT EXISTS public.company_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.company_branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.company_team_members (
  team_id UUID NOT NULL REFERENCES public.company_teams(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role_in_team TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_company_branches_company
  ON public.company_branches(company_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_company_teams_company
  ON public.company_teams(company_id) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- 5. Integrações (Torres Consulta, ERP, CRM, API pública, Flutter)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL
    CHECK (provider IN (
      'torres_consulta', 'erp', 'crm', 'public_api', 'flutter_mobile', 'webhook'
    )),
  status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('inactive', 'active', 'error')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  CONSTRAINT integration_connections_company_provider_unique
    UNIQUE (company_id, provider)
);

COMMENT ON TABLE public.integration_connections IS
  'Reservado: conexões B2B/B2C (Torres Consulta, ERP, CRM, API pública, app Flutter).';

-- ---------------------------------------------------------------------------
-- 6. Permissões customizadas por usuário (RBAC granular futuro)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_custom_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_code TEXT NOT NULL REFERENCES public.permissions(code) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  CONSTRAINT company_custom_permissions_unique
    UNIQUE (company_id, profile_id, permission_code)
);

COMMENT ON TABLE public.company_custom_permissions IS
  'Reservado: overrides de permissão por usuário dentro do tenant (papéis futuros).';

-- ---------------------------------------------------------------------------
-- 7. RLS — somente SUPER_ADMIN do tenant (mesma empresa)
-- ---------------------------------------------------------------------------
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_custom_permissions ENABLE ROW LEVEL SECURITY;

-- company_subscriptions
DROP POLICY IF EXISTS company_subscriptions_select ON public.company_subscriptions;
CREATE POLICY company_subscriptions_select ON public.company_subscriptions FOR SELECT
  USING (company_id = public.get_user_company_id() AND public.is_super_admin());

DROP POLICY IF EXISTS company_subscriptions_write ON public.company_subscriptions;
CREATE POLICY company_subscriptions_write ON public.company_subscriptions FOR ALL
  USING (company_id = public.get_user_company_id() AND public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() AND public.is_super_admin());

-- tenant_invitations
DROP POLICY IF EXISTS tenant_invitations_select ON public.tenant_invitations;
CREATE POLICY tenant_invitations_select ON public.tenant_invitations FOR SELECT
  USING (company_id = public.get_user_company_id() AND public.is_super_admin());

DROP POLICY IF EXISTS tenant_invitations_write ON public.tenant_invitations;
CREATE POLICY tenant_invitations_write ON public.tenant_invitations FOR ALL
  USING (company_id = public.get_user_company_id() AND public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() AND public.is_super_admin());

-- company_branches
DROP POLICY IF EXISTS company_branches_select ON public.company_branches;
CREATE POLICY company_branches_select ON public.company_branches FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    AND public.is_super_admin()
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS company_branches_write ON public.company_branches;
CREATE POLICY company_branches_write ON public.company_branches FOR ALL
  USING (company_id = public.get_user_company_id() AND public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() AND public.is_super_admin());

-- company_teams
DROP POLICY IF EXISTS company_teams_select ON public.company_teams;
CREATE POLICY company_teams_select ON public.company_teams FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    AND public.is_super_admin()
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS company_teams_write ON public.company_teams;
CREATE POLICY company_teams_write ON public.company_teams FOR ALL
  USING (company_id = public.get_user_company_id() AND public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() AND public.is_super_admin());

-- company_team_members
DROP POLICY IF EXISTS company_team_members_select ON public.company_team_members;
CREATE POLICY company_team_members_select ON public.company_team_members FOR SELECT
  USING (company_id = public.get_user_company_id() AND public.is_super_admin());

DROP POLICY IF EXISTS company_team_members_write ON public.company_team_members;
CREATE POLICY company_team_members_write ON public.company_team_members FOR ALL
  USING (company_id = public.get_user_company_id() AND public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() AND public.is_super_admin());

-- integration_connections
DROP POLICY IF EXISTS integration_connections_select ON public.integration_connections;
CREATE POLICY integration_connections_select ON public.integration_connections FOR SELECT
  USING (company_id = public.get_user_company_id() AND public.is_super_admin());

DROP POLICY IF EXISTS integration_connections_write ON public.integration_connections;
CREATE POLICY integration_connections_write ON public.integration_connections FOR ALL
  USING (company_id = public.get_user_company_id() AND public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() AND public.is_super_admin());

-- company_custom_permissions
DROP POLICY IF EXISTS company_custom_permissions_select ON public.company_custom_permissions;
CREATE POLICY company_custom_permissions_select ON public.company_custom_permissions FOR SELECT
  USING (company_id = public.get_user_company_id() AND public.is_super_admin());

DROP POLICY IF EXISTS company_custom_permissions_write ON public.company_custom_permissions;
CREATE POLICY company_custom_permissions_write ON public.company_custom_permissions FOR ALL
  USING (company_id = public.get_user_company_id() AND public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() AND public.is_super_admin());

-- Triggers updated_at (padrão do projeto)
DROP TRIGGER IF EXISTS trg_company_subscriptions_updated_at ON public.company_subscriptions;
CREATE TRIGGER trg_company_subscriptions_updated_at
  BEFORE UPDATE ON public.company_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_tenant_invitations_updated_at ON public.tenant_invitations;
CREATE TRIGGER trg_tenant_invitations_updated_at
  BEFORE UPDATE ON public.tenant_invitations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_company_branches_updated_at ON public.company_branches;
CREATE TRIGGER trg_company_branches_updated_at
  BEFORE UPDATE ON public.company_branches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_company_teams_updated_at ON public.company_teams;
CREATE TRIGGER trg_company_teams_updated_at
  BEFORE UPDATE ON public.company_teams
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_integration_connections_updated_at ON public.integration_connections;
CREATE TRIGGER trg_integration_connections_updated_at
  BEFORE UPDATE ON public.integration_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
