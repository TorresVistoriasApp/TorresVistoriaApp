-- FASE 3.1 — Catálogo global de serviços da plataforma Torres
--
-- platform_services é gerenciado exclusivamente pelo PLATFORM_ADMIN.
-- Não pertence a nenhum tenant. Vistoriadores e SUPER_ADMINs leem os
-- serviços ativos para exibir no modal de seleção; somente o service role
-- (via Edge Function ou painel do PLATFORM_ADMIN) cria/altera serviços.
--
-- Coexistência com inspection_types:
--   platform_services  → o que a plataforma Torres oferece (global)
--   inspection_types   → como o tenant precifica e nomeia internamente (por empresa)
-- Os dois conceitos são distintos e complementares; não há substituição.

-- ---------------------------------------------------------------------------
-- 1. Tabela
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.platform_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificador canônico — usado no código para lógica de negócio
  code TEXT NOT NULL UNIQUE,

  -- Dados comerciais exibidos na UI
  name TEXT NOT NULL,
  description TEXT,

  -- Preço-base oficial. O frontend NUNCA envia amount; o backend busca aqui.
  -- inspection_orders.amount é um snapshot imutável deste valor no momento da contratação.
  base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
  currency TEXT NOT NULL DEFAULT 'BRL',

  -- Shortcut para lógica de feature gate de consulta veicular.
  -- Redundante com features JSONB — mantido por conveniência em queries RLS e triggers.
  includes_vehicle_consultation BOOLEAN NOT NULL DEFAULT false,

  -- Lista extensível de capacidades: ["laudo", "vehicle_consultation", "plate_query", ...]
  -- Adicionar nova feature não exige migration de schema — só atualizar o registro.
  features JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Controle de exibição
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Auditoria padrão do projeto
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.platform_admins(id),
  updated_by UUID REFERENCES public.platform_admins(id)
);

COMMENT ON TABLE public.platform_services IS
  'Catálogo global de serviços da plataforma Torres. Gerenciado pelo PLATFORM_ADMIN; '
  'lido por todos os usuários autenticados (somente serviços ativos). '
  'Não pertence a nenhum tenant.';

COMMENT ON COLUMN public.platform_services.code IS
  'Identificador canônico imutável. Usado no código para lógica de negócio (ex.: LAUDO_CAUTELAR).';
COMMENT ON COLUMN public.platform_services.base_price IS
  'Preço oficial do serviço. O frontend não envia este valor — o backend sempre consulta aqui.';
COMMENT ON COLUMN public.platform_services.features IS
  'Lista de capacidades incluídas: ["laudo", "vehicle_consultation", ...]. '
  'Extensível sem migration de schema.';

-- ---------------------------------------------------------------------------
-- 2. Índices
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_platform_services_active
  ON public.platform_services(sort_order, name)
  WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_platform_services_code
  ON public.platform_services(code)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- 3. Trigger updated_at (padrão do projeto)
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_platform_services_updated_at ON public.platform_services;
CREATE TRIGGER trg_platform_services_updated_at
  BEFORE UPDATE ON public.platform_services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. RLS
--
-- SELECT: qualquer usuário autenticado vê serviços ativos.
--         PLATFORM_ADMIN (via service role) vê todos — sem policy necessária
--         porque service role bypassa RLS.
-- INSERT/UPDATE/DELETE: somente service role (PLATFORM_ADMIN via EF ou painel).
--         Nenhuma policy de escrita para `authenticated` — silêncio = negado.
-- ---------------------------------------------------------------------------

ALTER TABLE public.platform_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_services_select_active ON public.platform_services;
CREATE POLICY platform_services_select_active ON public.platform_services
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND deleted_at IS NULL
  );

-- Sem policies de INSERT, UPDATE, DELETE para authenticated:
-- escrita somente via service role (PLATFORM_ADMIN).

-- ---------------------------------------------------------------------------
-- 5. Seed inicial — serviços da plataforma Torres
--
-- Valores iniciais definidos aqui. O PLATFORM_ADMIN pode alterar via painel
-- futuramente. base_price é o snapshot para novas inspection_orders.
-- ---------------------------------------------------------------------------

INSERT INTO public.platform_services
  (code, name, description, base_price, currency, includes_vehicle_consultation, features, sort_order)
VALUES
  (
    'LAUDO_CAUTELAR',
    'Laudo Cautelar',
    'Realização da vistoria cautelar completa e emissão do laudo.',
    15.00,
    'BRL',
    false,
    '["laudo"]'::jsonb,
    1
  ),
  (
    'LAUDO_CAUTELAR_CONSULTA',
    'Laudo Cautelar + Consulta Veicular',
    'Vistoria cautelar completa + consulta do histórico veicular.',
    39.90,
    'BRL',
    true,
    '["laudo", "vehicle_consultation", "plate_query"]'::jsonb,
    2
  )
ON CONFLICT (code) DO NOTHING;
