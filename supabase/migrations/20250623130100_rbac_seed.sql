-- PASSO 3: seed RBAC completo (permissions + role_permissions)

INSERT INTO public.permissions (code, name, description) VALUES
  ('inspections.create', 'Criar vistorias', 'Criar novas vistorias cautelares'),
  ('inspections.read.own', 'Ver próprias vistorias', 'Visualizar vistorias do próprio usuário'),
  ('inspections.read.all', 'Ver todas vistorias', 'Visualizar vistorias de todos vistoriadores'),
  ('inspections.update.own', 'Editar próprias vistorias', 'Editar vistorias criadas pelo usuário'),
  ('financial.manage', 'Gerenciar financeiro', 'CRUD de lançamentos financeiros'),
  ('reports.export', 'Exportar relatórios', 'Exportar PDF, Excel e CSV'),
  ('settings.manage', 'Gerenciar configurações', 'Alterar dados da empresa e tema'),
  ('users.manage', 'Gerenciar usuários', 'CRUD de usuários e convites')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.code = 'SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r
JOIN public.permissions p ON p.code IN ('inspections.create','inspections.read.own','inspections.update.own')
WHERE r.code = 'VISTORIADOR'
ON CONFLICT (role_id, permission_id) DO NOTHING;
