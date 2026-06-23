-- Torres Vistoria — Seed data (Fase 1 single-tenant)
-- Executar após migrations. Usuário admin deve ser criado via Supabase Auth Dashboard.

INSERT INTO public.settings (company_id, primary_color, theme_mode, legal_footer)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  '#1e40af',
  'light',
  'Laudo emitido por Torres Vistoria. Documento válido mediante verificação do código QR.'
) ON CONFLICT (company_id) DO NOTHING;

INSERT INTO public.roles (code, name, description) VALUES
  ('SUPER_ADMIN', 'Super Administrador', 'Controle total do sistema'),
  ('VISTORIADOR', 'Vistoriador', 'Cria e edita próprias vistorias')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.permissions (code, name, description) VALUES
  ('inspections.create', 'Criar vistorias', 'Criar novas vistorias cautelares'),
  ('inspections.read.own', 'Ver próprias vistorias', 'Visualizar vistorias do próprio usuário'),
  ('inspections.read.all', 'Ver todas vistorias', 'Visualizar vistorias de todos vistoriadores'),
  ('inspections.update.own', 'Editar próprias vistorias', 'Editar vistorias criadas pelo usuário'),
  ('financial.manage', 'Gerenciar financeiro', 'CRUD de lançamentos financeiros'),
  ('reports.export', 'Exportar relatórios', 'Exportar PDF, Excel e CSV'),
  ('settings.manage', 'Gerenciar configurações', 'Alterar dados da empresa e tema'),
  ('users.manage', 'Gerenciar usuários', 'CRUD de usuários e convites')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.code = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r
JOIN public.permissions p ON p.code IN ('inspections.create','inspections.read.own','inspections.update.own')
WHERE r.code = 'VISTORIADOR'
ON CONFLICT DO NOTHING;
