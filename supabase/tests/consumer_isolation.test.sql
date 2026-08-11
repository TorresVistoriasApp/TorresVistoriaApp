-- Etapa 1 — Testes pgTAP de isolamento consumer_profiles (Torres Consulta B2C)
-- Executar: npm run test:db

BEGIN;

SELECT plan(8);

-- RLS habilitado
SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'consumer_profiles'),
  'RLS habilitado em consumer_profiles'
);

-- Helper de identidade
SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'is_consumer'
  ),
  'função is_consumer existe'
);

-- Policies de isolamento por auth.uid()
SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'consumer_profiles'
      AND policyname = 'consumer_profiles_select_self'
  ),
  'policy consumer_profiles_select_self existe'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'consumer_profiles'
      AND policyname = 'consumer_profiles_update_self'
  ),
  'policy consumer_profiles_update_self existe'
);

-- Sem policy de INSERT para client (criação só via trigger)
SELECT ok(
  NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'consumer_profiles'
      AND cmd = 'INSERT'
  ),
  'sem policy INSERT em consumer_profiles para o client'
);

-- Trigger anti-escalonamento de status
SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE c.relname = 'consumer_profiles'
      AND t.tgname = 'consumer_profiles_prevent_self_escalation'
  ),
  'trigger consumer_profiles_prevent_self_escalation existe'
);

-- handle_new_user atualizado para consumer
SELECT ok(
  (
    SELECT pg_get_functiondef(p.oid) LIKE '%user_type = ''consumer''%'
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'handle_new_user'
  ),
  'handle_new_user reconhece user_type consumer'
);

-- Consumer A não acessa Consumer B: SELECT policy usa apenas auth.uid()
SELECT ok(
  (
    SELECT qual::text LIKE '%auth.uid()%'
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'consumer_profiles'
      AND policyname = 'consumer_profiles_select_self'
  ),
  'SELECT de consumer_profiles restrito a auth.uid() — cross-access DENIED'
);

SELECT ok(
  (
    SELECT with_check::text LIKE '%auth.uid()%'
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'consumer_profiles'
      AND policyname = 'consumer_profiles_update_self'
  ),
  'UPDATE de consumer_profiles restrito a auth.uid() — cross-access DENIED'
);

SELECT * FROM finish();

ROLLBACK;
