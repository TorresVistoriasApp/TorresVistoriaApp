-- Etapa 16 — Testes pgTAP de isolamento multi-tenant
-- Executar: npm run test:db
-- Requer Supabase local (Docker) com migrations aplicadas.

BEGIN;

SELECT plan(11);

-- Helpers IMMUTABLE de path (Storage Etapa 6)
SELECT ok(
  public.is_canonical_inspection_photo_object_path(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/95968fbc-36d7-4e21-a4ad-dabc9390c390/EXT_FRENTE/foto.webp'
  ),
  'path canônico de foto é válido'
);

SELECT ok(
  NOT public.is_canonical_inspection_photo_object_path(
    'legado/95968fbc-36d7-4e21-a4ad-dabc9390c390/EXT_FRENTE/foto.webp'
  ),
  'path legado sem company_id é rejeitado'
);

SELECT ok(
  public.is_canonical_report_object_path(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/95968fbc-36d7-4e21-a4ad-dabc9390c390/laudo.pdf'
  ),
  'path canônico de laudo PDF é válido'
);

SELECT is(
  split_part(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/95968fbc-36d7-4e21-a4ad-dabc9390c390/EXT_FRENTE/foto.webp',
    '/',
    1
  ),
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'primeiro segmento do path é o company_id'
);

SELECT isnt(
  split_part(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/95968fbc-36d7-4e21-a4ad-dabc9390c390/EXT_FRENTE/foto.webp',
    '/',
    1
  ),
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'foto da Empresa B não compartilha prefixo da Empresa A'
);

-- Funções centrais de escopo (RLS Etapas 5 e 11)
SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'can_access_tenant_row'
  ),
  'função can_access_tenant_row existe'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'can_access_financial_row'
  ),
  'função can_access_financial_row existe'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'validate_inspection_photo_storage_path'
  ),
  'trigger de validação de storage_path em fotos existe'
);

-- RLS habilitado nas tabelas críticas
SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'inspections'),
  'RLS habilitado em inspections'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'financial_entries'),
  'RLS habilitado em financial_entries'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'audit_logs'),
  'RLS habilitado em audit_logs'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'inspection_photos'),
  'RLS habilitado em inspection_photos'
);

SELECT * FROM finish();

ROLLBACK;
