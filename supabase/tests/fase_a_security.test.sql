-- Fase A — regressão de HMAC, strip de metadata, lock de tenant_id e anonimização.
-- Executar: npm run test:db

BEGIN;

SELECT plan(24);

SELECT ok(
  EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'private'),
  'schema private existe para o pepper HMAC'
);

SELECT ok(
  NOT has_schema_privilege('anon', 'private', 'USAGE'),
  'anon não tem USAGE no schema private'
);

SELECT ok(
  NOT has_schema_privilege('authenticated', 'private', 'USAGE'),
  'authenticated não tem USAGE no schema private'
);

SELECT ok(
  NOT has_schema_privilege('service_role', 'private', 'USAGE'),
  'service_role não tem USAGE no schema private'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'hmac_inspector_document'
  ),
  'public.hmac_inspector_document existe'
);

SELECT ok(
  NOT has_function_privilege('anon', 'public.hmac_inspector_document(text)', 'execute'),
  'anon não executa hmac_inspector_document'
);

SELECT ok(
  NOT has_function_privilege('authenticated', 'public.hmac_inspector_document(text)', 'execute'),
  'authenticated não executa hmac_inspector_document'
);

SELECT ok(
  has_function_privilege('service_role', 'public.hmac_inspector_document(text)', 'execute'),
  'service_role executa hmac_inspector_document'
);

SELECT is(
  private.hmac_inspector_document('52998224725'),
  private.hmac_inspector_document('52998224725'),
  'HMAC do documento é determinístico'
);

SELECT isnt(
  private.hmac_inspector_document('52998224725'),
  encode(extensions.digest('52998224725', 'sha256'), 'hex'),
  'HMAC do documento não é SHA-256 puro'
);

SELECT ok(
  (
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'prepare_inspector_signup'
  ) LIKE '%hmac_inspector_document%',
  'prepare_inspector_signup grava HMAC, não o documento, na intent'
);

SELECT ok(
  (
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) LIKE '%strip_auth_user_document%',
  'handle_new_user remove document do Auth metadata'
);

SELECT ok(
  (
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) NOT LIKE '%digest(v_document_digits%',
  'handle_new_user não grava SHA-256 puro do documento'
);

SELECT ok(
  (
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'prevent_profile_self_escalation'
  ) LIKE '%NEW.tenant_id IS DISTINCT FROM OLD.tenant_id%',
  'self-update bloqueia alteração de tenant_id'
);

SELECT ok(
  (
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'prevent_profile_self_escalation'
  ) NOT LIKE '%IF public.is_super_admin() THEN%RETURN NEW;%',
  'SUPER_ADMIN não tem bypass total no self-update'
);

SELECT ok(
  (
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'anonymize_user_account'
  ) LIKE '%get_user_tenant_id() IS NOT DISTINCT FROM v_tenant_id%',
  'anonymize_user_account exige o mesmo tenant para SUPER_ADMIN'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'strip_own_auth_document_metadata'
  ),
  'strip_own_auth_document_metadata existe'
);

SELECT ok(
  has_function_privilege('authenticated', 'public.strip_own_auth_document_metadata()', 'execute'),
  'authenticated pode limpar o próprio document do Auth metadata'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'inspector_registrations'),
  'RLS permanece habilitado em inspector_registrations'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND t.tgname = 'trg_auth_users_stash_strip_document'
      AND NOT t.tgisinternal
  ),
  'trigger BEFORE INSERT/UPDATE remove document antes do JWT'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND t.tgname = 'trg_auth_users_stash_strip_document'
      AND NOT t.tgisinternal
      AND t.tgtype & 2 = 2
      AND t.tgtype & 4 = 4
      AND t.tgtype & 16 = 16
  ),
  'trigger remove document em BEFORE INSERT e BEFORE UPDATE'
);

SELECT ok(
  (
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) LIKE '%signup_intent_id%',
  'handle_new_user consome signup_intent_id, não o CPF no Auth metadata'
);

SELECT ok(
  NOT has_function_privilege('authenticated', 'public.prepare_inspector_signup(text, text)', 'execute'),
  'authenticated não executa prepare_inspector_signup'
);

SELECT ok(
  has_function_privilege('service_role', 'public.prepare_inspector_signup(text, text)', 'execute'),
  'service_role executa prepare_inspector_signup'
);

SELECT * FROM finish();

ROLLBACK;
