-- Fase B — resultado B2C só no servidor, RPC validate_report fora do
-- PostgREST autenticado, rate limit persistente para Edges.

-- ---------------------------------------------------------------------------
-- 1. Rate limit no schema private (não enumerável via PostgREST)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS private.rate_limit_buckets (
  bucket_key TEXT PRIMARY KEY,
  hit_count INTEGER NOT NULL CHECK (hit_count >= 0),
  window_starts_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE private.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE private.rate_limit_buckets FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.consume_rate_limit(
  p_key TEXT,
  p_max INTEGER,
  p_window_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, pg_temp
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_key TEXT := NULLIF(btrim(coalesce(p_key, '')), '');
  v_row private.rate_limit_buckets%ROWTYPE;
  v_retry INTEGER;
BEGIN
  IF v_key IS NULL THEN
    v_key := 'unknown';
  END IF;
  IF p_max IS NULL OR p_max < 1 THEN
    RAISE EXCEPTION 'Limite de taxa inválido.'
      USING ERRCODE = '22023';
  END IF;
  IF p_window_seconds IS NULL OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'Janela de taxa inválida.'
      USING ERRCODE = '22023';
  END IF;

  IF random() < 0.01 THEN
    DELETE FROM private.rate_limit_buckets
    WHERE window_starts_at < v_now - INTERVAL '1 day';
  END IF;

  LOOP
    SELECT * INTO v_row
    FROM private.rate_limit_buckets
    WHERE bucket_key = v_key
    FOR UPDATE;

    IF NOT FOUND THEN
      BEGIN
        INSERT INTO private.rate_limit_buckets (bucket_key, hit_count, window_starts_at)
        VALUES (v_key, 1, v_now);
        RETURN jsonb_build_object('allowed', true, 'retry_after_seconds', 0);
      EXCEPTION
        WHEN unique_violation THEN
          CONTINUE;
      END;
    END IF;

    IF v_now >= v_row.window_starts_at + make_interval(secs => p_window_seconds) THEN
      UPDATE private.rate_limit_buckets
      SET hit_count = 1,
          window_starts_at = v_now
      WHERE bucket_key = v_key;
      RETURN jsonb_build_object('allowed', true, 'retry_after_seconds', 0);
    END IF;

    IF v_row.hit_count >= p_max THEN
      v_retry := GREATEST(
        1,
        CEIL(
          EXTRACT(
            EPOCH FROM (
              v_row.window_starts_at + make_interval(secs => p_window_seconds) - v_now
            )
          )
        )::INTEGER
      );
      RETURN jsonb_build_object('allowed', false, 'retry_after_seconds', v_retry);
    END IF;

    UPDATE private.rate_limit_buckets
    SET hit_count = hit_count + 1
    WHERE bucket_key = v_key;
    RETURN jsonb_build_object('allowed', true, 'retry_after_seconds', 0);
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION private.consume_rate_limit(TEXT, INTEGER, INTEGER)
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key TEXT,
  p_max INTEGER,
  p_window_seconds INTEGER
)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = private, pg_temp
AS $$
  SELECT private.consume_rate_limit(p_key, p_max, p_window_seconds);
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;

-- ---------------------------------------------------------------------------
-- 2. NS-005 — consumidor não grava resultado / URL / payload / status
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.prevent_consumer_consulta_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role / jobs sem JWT: único canal que persiste o resultado oficial.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Consumidor não pode alterar consulta existente.'
      USING ERRCODE = '42501';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.consumer_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'Não é permitido criar consulta para outro consumidor.'
        USING ERRCODE = '42501';
    END IF;

    NEW.status := 'PROCESSING';
    NEW.credits_charged := 0;
    NEW.result_payload := NULL;
    NEW.document_url := NULL;
    NEW.failure_reason := NULL;
    NEW.completed_at := NULL;
    NEW.deleted_at := NULL;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_consumer_consulta_tampering() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS consumer_consultas_insert_self ON public.consumer_consultas;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.consumer_consultas FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.consumer_consultas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.consumer_consultas TO service_role;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.consumer_credit_balances FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.consumer_credit_balances TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.consumer_credit_balances TO service_role;

CREATE OR REPLACE FUNCTION public.request_consumer_consulta(
  p_plan_name TEXT,
  p_plate TEXT DEFAULT NULL,
  p_chassis TEXT DEFAULT NULL
)
RETURNS public.consumer_consultas
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_row public.consumer_consultas;
  v_plan TEXT := btrim(coalesce(p_plan_name, ''));
  v_plate TEXT;
  v_chassis TEXT;
  v_query_type TEXT;
  v_limit JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado.'
      USING ERRCODE = '42501';
  END IF;

  IF NOT public.is_consumer() THEN
    RAISE EXCEPTION 'Apenas consumidores ativos podem solicitar consulta.'
      USING ERRCODE = '42501';
  END IF;

  v_query_type := CASE v_plan
    WHEN 'Básico' THEN 'BASIC'
    WHEN 'Completo' THEN 'COMPLETE'
    WHEN 'Premium' THEN 'COMPLETE'
    ELSE NULL
  END;

  IF v_query_type IS NULL THEN
    RAISE EXCEPTION 'Plano de consulta inválido.'
      USING ERRCODE = '22023';
  END IF;

  v_plate := NULLIF(upper(regexp_replace(coalesce(p_plate, ''), '\s+', '', 'g')), '');
  v_chassis := NULLIF(upper(regexp_replace(coalesce(p_chassis, ''), '\s+', '', 'g')), '');

  IF v_plate IS NULL AND v_chassis IS NULL THEN
    RAISE EXCEPTION 'Informe placa ou chassi.'
      USING ERRCODE = '22023';
  END IF;

  v_limit := private.consume_rate_limit(
    'consumer-consulta:' || auth.uid()::TEXT,
    10,
    900
  );
  IF coalesce((v_limit ->> 'allowed')::BOOLEAN, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'Muitas consultas. Aguarde e tente novamente.'
      USING ERRCODE = '54000';
  END IF;

  INSERT INTO public.consumer_consultas (
    consumer_id,
    plan_name,
    query_type,
    plate,
    chassis,
    status,
    credits_charged,
    result_payload,
    document_url,
    failure_reason,
    completed_at,
    deleted_at
  ) VALUES (
    auth.uid(),
    v_plan,
    v_query_type,
    v_plate,
    v_chassis,
    'PROCESSING',
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.request_consumer_consulta(TEXT, TEXT, TEXT)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_consumer_consulta(TEXT, TEXT, TEXT) TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. NS-008 — validate_report não é superfície pública/autenticada
--    A Edge validate-report consulta as tabelas com service_role.
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.validate_report(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_report(TEXT) TO service_role;
