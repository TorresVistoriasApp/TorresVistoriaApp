-- Fase E — regressão de isolamento, JWT/role no banco e tampering.
-- Executar: npm run test:db (requer Docker / Supabase local).

BEGIN;

SELECT plan(12);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'can_access_tenant_row'
  ),
  'can_access_tenant_row existe'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'can_access_inspection_row'
  ),
  'can_access_inspection_row existe'
);

SELECT ok(
  (
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'can_access_inspection_row'
  ) LIKE '%get_user_tenant_id%',
  'acesso à vistoria valida o tenant da sessão'
);

SELECT ok(
  (
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'prevent_profile_self_escalation'
  ) LIKE '%NEW.tenant_id IS DISTINCT FROM OLD.tenant_id%',
  'self-update bloqueia troca de tenant_id'
);

SELECT ok(
  (
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'anonymize_user_account'
  ) LIKE '%get_user_tenant_id() IS NOT DISTINCT FROM v_tenant_id%',
  'anonymize não atravessa tenant'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'inspections'),
  'RLS habilitado em inspections'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'consumer_consultas'),
  'RLS habilitado em consumer_consultas'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'consumer_consultas'
      AND policyname = 'consumer_consultas_select_self'
  ),
  'policy SELECT de consulta é só o próprio consumidor'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'prevent_consumer_consulta_tampering'
  ),
  'trigger de tampering B2C existe'
);

SELECT ok(
  NOT has_table_privilege('anon', 'public.consumer_consultas', 'insert'),
  'anon não insere em consumer_consultas'
);

SELECT ok(
  NOT has_table_privilege('authenticated', 'public.consumer_consultas', 'insert'),
  'authenticated não insere direto em consumer_consultas'
);

SELECT ok(
  (
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'redact_audit_jsonb'
  ) LIKE '%client_document%',
  'auditoria redige documento do cliente'
);

SELECT * FROM finish();

ROLLBACK;
