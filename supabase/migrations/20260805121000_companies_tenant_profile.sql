-- Etapa 1 da refatoração multi-tenant: perfil completo da empresa (tenant root).
-- Migração aditiva: preserva os dados já existentes em `companies`/`settings`.

ALTER TABLE public.companies RENAME COLUMN name TO trade_name;

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS legal_name TEXT;

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS subscription_plan TEXT
  NOT NULL DEFAULT 'starter';
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_subscription_plan_check;
ALTER TABLE public.companies ADD CONSTRAINT companies_subscription_plan_check
  CHECK (subscription_plan IN ('starter', 'professional', 'enterprise'));

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS status TEXT
  NOT NULL DEFAULT 'trial';
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_status_check;
ALTER TABLE public.companies ADD CONSTRAINT companies_status_check
  CHECK (status IN ('trial', 'active', 'suspended', 'canceled'));

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS primary_color TEXT
  NOT NULL DEFAULT '#1e40af';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS secondary_color TEXT
  NOT NULL DEFAULT '#0f172a';

-- Empresas já cadastradas viram "active" (não estão em trial) e mantêm a
-- cor primária que já haviam configurado em `settings`.
UPDATE public.companies SET status = 'active' WHERE deleted_at IS NULL;

UPDATE public.companies c
SET primary_color = s.primary_color
FROM public.settings s
WHERE s.company_id = c.id
  AND s.deleted_at IS NULL;

ALTER TABLE public.settings DROP COLUMN IF EXISTS primary_color;

COMMENT ON COLUMN public.companies.trade_name IS 'Nome fantasia da empresa';
COMMENT ON COLUMN public.companies.legal_name IS 'Razão social (opcional, nem toda empresa legada tem esse dado)';
COMMENT ON COLUMN public.companies.subscription_plan IS 'Plano contratado do SaaS: starter | professional | enterprise';
COMMENT ON COLUMN public.companies.status IS 'Status do tenant: trial | active | suspended | canceled';
