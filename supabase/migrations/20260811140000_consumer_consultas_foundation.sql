-- Etapa 4 — Consultas B2C e saldo de créditos do consumidor (Torres Consulta).

-- ---------------------------------------------------------------------------
-- 1. Saldo de créditos (preparado para pagamentos futuros)
-- ---------------------------------------------------------------------------

CREATE TABLE public.consumer_credit_balances (
  consumer_id UUID PRIMARY KEY REFERENCES public.consumer_profiles(id) ON DELETE CASCADE,
  available INTEGER NOT NULL DEFAULT 0 CHECK (available >= 0),
  pending INTEGER NOT NULL DEFAULT 0 CHECK (pending >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_consumer_credit_balances_updated_at ON public.consumer_credit_balances;
CREATE TRIGGER trg_consumer_credit_balances_updated_at
  BEFORE UPDATE ON public.consumer_credit_balances
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.initialize_consumer_credit_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.consumer_credit_balances (consumer_id, available, pending)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (consumer_id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.initialize_consumer_credit_balance() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_consumer_profiles_credit_balance ON public.consumer_profiles;
CREATE TRIGGER trg_consumer_profiles_credit_balance
  AFTER INSERT ON public.consumer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_consumer_credit_balance();

-- ---------------------------------------------------------------------------
-- 2. Consultas veiculares B2C
-- ---------------------------------------------------------------------------

CREATE TABLE public.consumer_consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.consumer_profiles(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  query_type TEXT NOT NULL,
  plate TEXT,
  chassis TEXT,
  status TEXT NOT NULL DEFAULT 'PROCESSING'
    CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
  credits_charged INTEGER NOT NULL DEFAULT 0 CHECK (credits_charged >= 0),
  failure_reason TEXT,
  document_url TEXT,
  result_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT consumer_consultas_identifier_check CHECK (
    plate IS NOT NULL OR chassis IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_consumer_consultas_consumer_created
  ON public.consumer_consultas (consumer_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE OR REPLACE FUNCTION public.prevent_consumer_consulta_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.consumer_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'Não é permitido criar consulta para outro consumidor.'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.status <> 'PROCESSING' THEN
      RAISE EXCEPTION 'Nova consulta deve iniciar com status PROCESSING.'
        USING ERRCODE = '42501';
    END IF;
    NEW.credits_charged := 0;
    RETURN NEW;
  END IF;

  IF NEW.consumer_id IS DISTINCT FROM OLD.consumer_id THEN
    RAISE EXCEPTION 'consumer_id de consulta não pode ser alterado.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_consumer_consulta_tampering() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS consumer_consultas_prevent_tampering ON public.consumer_consultas;
CREATE TRIGGER consumer_consultas_prevent_tampering
  BEFORE INSERT OR UPDATE ON public.consumer_consultas
  FOR EACH ROW EXECUTE FUNCTION public.prevent_consumer_consulta_tampering();

-- ---------------------------------------------------------------------------
-- 3. RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.consumer_credit_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY consumer_credit_balances_select_self ON public.consumer_credit_balances
  FOR SELECT
  USING (consumer_id = auth.uid());

ALTER TABLE public.consumer_consultas ENABLE ROW LEVEL SECURITY;

CREATE POLICY consumer_consultas_select_self ON public.consumer_consultas
  FOR SELECT
  USING (
    consumer_id = auth.uid()
    AND deleted_at IS NULL
  );

CREATE POLICY consumer_consultas_insert_self ON public.consumer_consultas
  FOR INSERT
  WITH CHECK (
    consumer_id = auth.uid()
    AND deleted_at IS NULL
  );

-- UPDATE/DELETE apenas via service role ou funções futuras de integração.

-- ---------------------------------------------------------------------------
-- 4. Backfill saldo para consumidores já existentes
-- ---------------------------------------------------------------------------

INSERT INTO public.consumer_credit_balances (consumer_id, available, pending)
SELECT cp.id, 0, 0
FROM public.consumer_profiles cp
WHERE cp.deleted_at IS NULL
ON CONFLICT (consumer_id) DO NOTHING;
