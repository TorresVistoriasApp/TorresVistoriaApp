-- Contas demo locais: criação movida para fora de migrations versionadas.
-- Em `supabase db reset`, crie o admin pelo Studio (Auth > Users) com
-- company_id/role no app_metadata, ou use o seed de roles em seed.sql.
--
-- Esta migration permanece apenas como no-op para não recriar senhas
-- conhecidas em novos ambientes a partir do histórico do Git.

SELECT 1;
