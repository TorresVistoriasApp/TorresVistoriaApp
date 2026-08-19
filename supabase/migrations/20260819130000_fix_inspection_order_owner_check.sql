-- CORREÇÃO C.1 — Verificação de proprietário da inspection ao criar inspection_order
--
-- Vulnerabilidade identificada na auditoria pós-Fase 3:
--   Um INSPECTOR podia criar uma inspection_order vinculada a uma inspection
--   pertencente a OUTRO INSPECTOR do mesmo tenant, pois o trigger anterior
--   validava apenas que inspection.tenant_id = order.tenant_id, sem verificar
--   se o usuário autenticado tem autorização de acesso àquela inspection.
--
-- Correção:
--   O INSERT em inspection_orders agora usa can_access_inspection_row(inspection_id),
--   que já encapsula a regra completa do sistema:
--     SUPER_ADMIN → acessa qualquer inspection do próprio tenant
--     INSPECTOR   → acessa somente inspections com created_by = auth.uid()
--     outro       → sem acesso
--
--   auth.uid() IS NULL (service role) → bypass permitido para operações administrativas.
--
-- Campos imutáveis do UPDATE: created_by adicionado à lista de proteção
--   (estava ausente na versão anterior — cobertura completa de campos críticos).

CREATE OR REPLACE FUNCTION public.enforce_inspection_order_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_service    RECORD;
  v_inspection RECORD;
BEGIN
  -- ── INSERT ──────────────────────────────────────────────────────────────────
  IF TG_OP = 'INSERT' THEN

    -- 1. Valida que o serviço existe e está ativo
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

    -- 2. Valida que a inspection existe e pertence ao tenant da order
    SELECT id, tenant_id, created_by
    INTO v_inspection
    FROM public.inspections
    WHERE id = NEW.inspection_id
      AND tenant_id = NEW.tenant_id
      AND deleted_at IS NULL;

    IF NOT FOUND THEN
      -- Mensagem genérica: não revela se a inspection existe em outro tenant
      RAISE EXCEPTION 'Vistoria não encontrada ou acesso negado.'
        USING ERRCODE = '42501';
    END IF;

    -- 3. Verificação de autorização do usuário sobre a inspection (CORREÇÃO C.1)
    --
    --    auth.uid() IS NULL → chamada via service role → sem restrição (operação administrativa).
    --    auth.uid() não nulo → usuário autenticado → aplica regras de RBAC:
    --      SUPER_ADMIN → pode criar order para qualquer inspection do tenant
    --      INSPECTOR   → só pode criar order para inspection de sua própria autoria
    --      outro       → bloqueado
    --
    --    Usa can_access_inspection_row() que encapsula o modelo de acesso canônico
    --    do sistema, evitando duplicação de lógica e garantindo consistência com
    --    as demais policies RLS.
    IF auth.uid() IS NOT NULL THEN
      IF NOT public.can_access_inspection_row(NEW.inspection_id) THEN
        -- Mensagem genérica: não confirma existência de inspection de outro usuário
        RAISE EXCEPTION 'Vistoria não encontrada ou acesso negado.'
          USING ERRCODE = '42501';
      END IF;
    END IF;

    -- 4. Snapshot de preço: sobrescreve amount com o valor oficial do banco.
    --    O cliente não controla este campo.
    NEW.amount   := v_service.base_price;
    NEW.currency := v_service.currency;

    RETURN NEW;
  END IF;

  -- ── UPDATE (por usuário autenticado) ───────────────────────────────────────
  --
  -- Sem policy de UPDATE para `authenticated` → UPDATE já é bloqueado pelo RLS.
  -- Este bloco é uma segunda camada de defesa para o caso de uma policy de UPDATE
  -- ser adicionada no futuro.
  IF TG_OP = 'UPDATE' AND auth.uid() IS NOT NULL THEN

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

    -- Campo adicionado nesta correção: created_by também é imutável
    IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
      RAISE EXCEPTION 'O criador do pedido não pode ser alterado.'
        USING ERRCODE = '42501';
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- REVOKE/GRANT permanecem idênticos — a função é SECURITY DEFINER
REVOKE ALL ON FUNCTION public.enforce_inspection_order_integrity()
  FROM PUBLIC, anon, authenticated;

-- O trigger já existe; recriamos para garantir que aponta à versão atualizada
DROP TRIGGER IF EXISTS trg_enforce_inspection_order_integrity ON public.inspection_orders;
CREATE TRIGGER trg_enforce_inspection_order_integrity
  BEFORE INSERT OR UPDATE ON public.inspection_orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_inspection_order_integrity();
