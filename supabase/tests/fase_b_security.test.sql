-- Fase B — resultado B2C só via servidor, RPC validate_report e rate limit.
-- Executar: npm run test:db

BEGIN;

SELECT plan(12);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'private' AND c.relname = 'rate_limit_buckets'
  ),
  'private.rate_limit_buckets existe'
);

SELECT ok(
  NOT has_table_privilege('anon', 'public.consumer_consultas', 'INSERT'),
  'anon não insere em consumer_consultas'
);

SELECT ok(
  NOT has_table_privilege('authenticated', 'public.consumer_consultas', 'INSERT'),
  'authenticated não insere em consumer_consultas'
);

SELECT ok(
  NOT has_table_privilege('authenticated', 'public.consumer_consultas', 'UPDATE'),
  'authenticated não atualiza consumer_consultas'
);

SELECT ok(
  has_table_privilege('authenticated', 'public.consumer_consultas', 'SELECT'),
  'authenticated lê as próprias consultas (RLS)'
);

SELECT ok(
  NOT has_function_privilege('anon', 'public.consume_rate_limit(text, integer, integer)', 'execute'),
  'anon não executa consume_rate_limit'
);

SELECT ok(
  NOT has_function_privilege('authenticated', 'public.consume_rate_limit(text, integer, integer)', 'execute'),
  'authenticated não executa consume_rate_limit'
);

SELECT ok(
  has_function_privilege('service_role', 'public.consume_rate_limit(text, integer, integer)', 'execute'),
  'service_role executa consume_rate_limit'
);

SELECT ok(
  has_function_privilege('authenticated', 'public.request_consumer_consulta(text, text, text)', 'execute'),
  'authenticated executa request_consumer_consulta'
);

SELECT ok(
  NOT has_function_privilege('anon', 'public.validate_report(text)', 'execute'),
  'anon não executa validate_report'
);

SELECT ok(
  NOT has_function_privilege('authenticated', 'public.validate_report(text)', 'execute'),
  'authenticated não executa validate_report'
);

SELECT ok(
  (
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'prevent_consumer_consulta_tampering'
  ) LIKE '%NEW.result_payload := NULL%',
  'trigger zera result_payload no INSERT autenticado'
);

SELECT * FROM finish();
ROLLBACK;
