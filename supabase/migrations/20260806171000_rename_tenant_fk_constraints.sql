-- Renomeia as foreign keys `<tabela>_company_id_fkey` para `<tabela>_tenant_id_fkey`.
--
-- O RENAME COLUMN da migration anterior manteve as constraints funcionando (elas
-- referenciam a coluna pelo número do atributo), mas não mudou o nome do objeto.
-- Como esses nomes aparecem em mensagens de erro do Postgres e nos tipos gerados
-- pelo `supabase gen types`, deixá-los como estão faria o erro apontar para uma
-- coluna que não existe mais.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname, t.relname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND c.contype = 'f'
      AND c.conname LIKE '%\_company\_id\_fkey'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I RENAME CONSTRAINT %I TO %I',
      r.relname,
      r.conname,
      replace(r.conname, '_company_id_fkey', '_tenant_id_fkey')
    );
  END LOOP;
END $$;
