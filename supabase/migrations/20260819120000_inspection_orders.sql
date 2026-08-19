-- FASE 3.3 — Pedidos de serviço (inspection_orders)
--
-- Cada vistoria criada com platform_service_id gera automaticamente um
-- inspection_order com o snapshot imutável do preço oficial do serviço.
--
-- O frontend NUNCA informa amount: o trigger busca base_price em
-- platform_services e o grava em inspection_orders.amount.
--
-- Idempotência: idempotency_key UUID UNIQUE garante que requisições
-- duplicadas (double-tap, retry de rede) retornem a order existente
-- sem criar duplicata.
--
-- Compatibilidade: vistorias legadas (platform_service_id IS NULL)
-- não têm inspection_order e continuam funcionando sem alteração.
--
-- Pagamento: payment_status = 'pending' por padrão. O bloqueio de
-- geração de laudo só será ativado quando o gateway real for integrado.

-- ---------------------------------------------------------------------------
-- 1. Tabela
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.inspection_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referências
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.companies(id),
  platform_service_id UUID NOT NULL REFERENCES public.platform_services(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),

  -- Snapshot imutável do preço no momento da contratação.
  -- Preenchido pelo trigger — o cliente não envia este valor.
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'BRL',

  -- Ciclo de vida do pagamento
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  paid_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- Metadados livres para uso futuro do gateway
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Idempotência: UUID gerado pelo frontend antes da requisição.
  -- Garante que retries não criem duplicatas.
  idempotency_key UUID NOT NULL,

  -- Uma vistoria = um pedido; um idempotency_key = um pedido.
  CONSTRAINT inspection_orders_inspection_unique UNIQUE (inspection_id),
  CONSTRAINT inspection_orders_idempotency_unique UNIQUE (idempotency_key),

  -- Auditoria
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.inspection_orders IS
  'Pedido de serviço associado a uma vistoria. amount é snapshot imutável do preço '
  'vigente em platform_services no momento da criação. '
  'Vistorias legadas (platform_service_id IS NULL em inspections) não têm order.';

COMMENT ON COLUMN public.inspection_orders.amount IS
  'Snapshot do preço oficial do serviço no momento da contratação. '
  'Gravado pelo trigger — nunca pelo frontend.';

COMMENT ON COLUMN public.inspection_orders.idempotency_key IS
  'UUID gerado pelo frontend antes da requisição. Previne duplicatas por double-tap ou retry de rede.';

-- ---------------------------------------------------------------------------
-- 2. Índices
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_inspection_orders_tenant
  ON public.inspection_orders(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inspection_orders_created_by
  ON public.inspection_orders(created_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inspection_orders_status
  ON public.inspection_orders(payment_status)
  WHERE payment_status <> 'paid';

-- ---------------------------------------------------------------------------
-- 3. Trigger updated_at
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_inspection_orders_updated_at ON public.inspection_orders;
CREATE TRIGGER trg_inspection_orders_updated_at
  BEFORE UPDATE ON public.inspection_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Trigger: snapshot seguro de preço
--
-- No INSERT:
--   - Ignora qualquer amount enviado pelo cliente.
--   - Busca base_price em platform_services.
--   - Valida que o serviço está ativo e que o inspection_id pertence ao tenant.
--   - Grava amount = base_price oficial.
--
-- No UPDATE:
--   - Impede alteração de amount, platform_service_id e inspection_id
--     por usuário autenticado.
--   - service role pode alterar (correções administrativas auditadas).
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enforce_inspection_order_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_service RECORD;
  v_inspection RECORD;
BEGIN
  -- ── INSERT ──────────────────────────────────────────────────────────────
  IF TG_OP = 'INSERT' THEN

    -- 1. Busca e valida o serviço
    SELECT id, base_price, currency, is_active
    INTO v_service
    FROM public.platform_services
    WHERE id = NEW.platform_service_id
      AND is_active = true
      AND deleted_at IS NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Serviço de plataforma inválido ou inativo (id: %).',
        NEW.platform_service_id
        USING ERRCODE = '42501';
    END IF;

    -- 2. Verifica que a vistoria pertence ao tenant correto
    SELECT id, tenant_id
    INTO v_inspection
    FROM public.inspections
    WHERE id = NEW.inspection_id
      AND tenant_id = NEW.tenant_id
      AND deleted_at IS NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Vistoria não encontrada ou não pertence ao tenant informado.'
        USING ERRCODE = '42501';
    END IF;

    -- 3. Sobrescreve amount com o preço oficial (o cliente não controla este valor)
    NEW.amount := v_service.base_price;
    NEW.currency := v_service.currency;

    RETURN NEW;
  END IF;

  -- ── UPDATE (por usuário autenticado) ─────────────────────────────────────
  IF TG_OP = 'UPDATE' AND auth.uid() IS NOT NULL THEN

    -- Campos comercialmente críticos: imutáveis pelo cliente
    IF NEW.amount IS DISTINCT FROM OLD.amount THEN
      RAISE EXCEPTION 'O valor do pedido não pode ser alterado.'
        USING ERRCODE = '42501';
    END IF;

    IF NEW.platform_service_id IS DISTINCT FROM OLD.platform_service_id THEN
      RAISE EXCEPTION 'O serviço contratado não pode ser alterado após a criação.'
        USING ERRCODE = '42501';
    END IF;

    IF NEW.inspection_id IS DISTINCT FROM OLD.inspection_id THEN
      RAISE EXCEPTION 'A vistoria vinculada ao pedido não pode ser alterada.'
        USING ERRCODE = '42501';
    END IF;

    IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
      RAISE EXCEPTION 'O tenant do pedido não pode ser alterado.'
        USING ERRCODE = '42501';
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_inspection_order_integrity()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_enforce_inspection_order_integrity ON public.inspection_orders;
CREATE TRIGGER trg_enforce_inspection_order_integrity
  BEFORE INSERT OR UPDATE ON public.inspection_orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_inspection_order_integrity();

-- ---------------------------------------------------------------------------
-- 5. RLS
--
-- SELECT:
--   SUPER_ADMIN → todos os pedidos do próprio tenant
--   INSPECTOR   → somente pedidos criados por ele (created_by = auth.uid())
--
-- INSERT:
--   SUPER_ADMIN e INSPECTOR podem criar pedidos para o próprio tenant.
--   O trigger garante que amount vem sempre do banco.
--
-- UPDATE / DELETE:
--   Somente service role. Usuários autenticados não alteram pedidos diretamente.
--   (Atualização de payment_status via webhook → Edge Function com service role)
-- ---------------------------------------------------------------------------

ALTER TABLE public.inspection_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inspection_orders_select ON public.inspection_orders;
CREATE POLICY inspection_orders_select ON public.inspection_orders
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id()
    AND (
      public.is_super_admin()
      OR created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS inspection_orders_insert ON public.inspection_orders;
CREATE POLICY inspection_orders_insert ON public.inspection_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = public.get_user_tenant_id()
    AND created_by = auth.uid()
    AND (
      public.is_super_admin()
      OR public.is_inspector()
    )
  );

-- Sem policies de UPDATE/DELETE para authenticated: somente service role.
