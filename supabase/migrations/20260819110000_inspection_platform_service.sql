-- FASE 3.2 — Vínculo entre vistoria e serviço da plataforma
--
-- Adiciona platform_service_id em inspections (nullable para compatibilidade
-- com vistorias legadas) e trigger que:
--   1. Valida que o serviço existe e está ativo.
--   2. Impede alteração do serviço após a criação (imutável pelo cliente).
--
-- Vistorias com platform_service_id = NULL são "legado": continuam
-- funcionando normalmente, sem qualquer restrição adicional.

-- ---------------------------------------------------------------------------
-- 1. Coluna em inspections
-- ---------------------------------------------------------------------------

ALTER TABLE public.inspections
  ADD COLUMN IF NOT EXISTS platform_service_id UUID
    REFERENCES public.platform_services(id);

COMMENT ON COLUMN public.inspections.platform_service_id IS
  'Serviço da plataforma Torres contratado nesta vistoria. '
  'NULL = vistoria legada (pré-Fase 3). Imutável após a criação no fluxo novo.';

CREATE INDEX IF NOT EXISTS idx_inspections_platform_service_id
  ON public.inspections(platform_service_id)
  WHERE platform_service_id IS NOT NULL AND deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- 2. Trigger: validação e imutabilidade do serviço
--
-- No INSERT: verifica que o serviço existe e está ativo (quando informado).
-- No UPDATE: bloqueia alteração de platform_service_id por usuário autenticado.
--            Somente service role pode alterar (para correções administrativas).
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_inspection_platform_service()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vistorias legadas (sem service_id): sem restrição.
  IF NEW.platform_service_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- INSERT: verifica serviço ativo.
  IF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.platform_services
      WHERE id = NEW.platform_service_id
        AND is_active = true
        AND deleted_at IS NULL
    ) THEN
      RAISE EXCEPTION 'Serviço da plataforma inválido ou inativo (id: %).',
        NEW.platform_service_id
        USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE: impede alteração de platform_service_id por usuário autenticado.
  -- auth.uid() IS NULL = chamada via service role → permite.
  IF TG_OP = 'UPDATE'
     AND auth.uid() IS NOT NULL
     AND NEW.platform_service_id IS DISTINCT FROM OLD.platform_service_id
  THEN
    RAISE EXCEPTION
      'O serviço contratado não pode ser alterado após a criação da vistoria.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_inspection_platform_service()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_validate_inspection_platform_service ON public.inspections;
CREATE TRIGGER trg_validate_inspection_platform_service
  BEFORE INSERT OR UPDATE OF platform_service_id ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION public.validate_inspection_platform_service();
