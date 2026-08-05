-- Torres Consulta — permissões do novo módulo
--
-- A matriz do frontend (`src/core/rbac/permissions.ts`) e a tabela
-- `public.permissions` precisam listar os mesmos códigos: o teste
-- `tests/integration/rbac-seed.test.ts` falha quando divergem.

INSERT INTO public.permissions (code, name, description) VALUES
  (
    'consulta.create',
    'Criar consultas veiculares',
    'Solicitar consultas de placa ou chassi consumindo créditos'
  ),
  (
    'consulta.read.own',
    'Ver próprias consultas',
    'Visualizar o histórico de consultas do próprio usuário'
  ),
  (
    'consulta.read.all',
    'Ver todas as consultas',
    'Visualizar o histórico de consultas de toda a empresa'
  ),
  (
    'consulta.credits.manage',
    'Gerenciar créditos',
    'Comprar créditos e administrar o saldo da empresa'
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- SUPER_ADMIN acumula todas as permissões do módulo.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p
  ON p.code IN (
    'consulta.create',
    'consulta.read.own',
    'consulta.read.all',
    'consulta.credits.manage'
  )
WHERE r.code = 'SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSPECTOR consulta e enxerga apenas o próprio histórico; comprar crédito é do admin.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code IN ('consulta.create', 'consulta.read.own')
WHERE r.code = 'INSPECTOR'
ON CONFLICT (role_id, permission_id) DO NOTHING;
