-- Demo users: Super Admin + Vistoriador
-- Senha padrão: TorresDemo2026!

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_company UUID := '00000000-0000-4000-8000-000000000001';
  v_admin UUID := '11111111-1111-4111-8111-111111111101';
  v_vistoriador UUID := '11111111-1111-4111-8111-111111111102';
  v_pwd TEXT := 'TorresDemo2026!';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@torresvistorias.com.br') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, last_sign_in_at,
      confirmation_token, recovery_token, email_change, email_change_token_new,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, is_sso_user
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_admin, 'authenticated', 'authenticated',
      'admin@torresvistorias.com.br', crypt(v_pwd, gen_salt('bf')),
      NOW(), NOW(), '', '', '', '',
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'company_id', v_company::text, 'role', 'SUPER_ADMIN'),
      jsonb_build_object('full_name', 'Torres Vistorias Admin'),
      NOW(), NOW(), FALSE
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      v_admin, v_admin,
      jsonb_build_object('sub', v_admin::text, 'email', 'admin@torresvistorias.com.br', 'email_verified', true, 'phone_verified', false),
      'email', 'admin@torresvistorias.com.br', NOW(), NOW(), NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vistoriador@torresvistorias.com.br') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, last_sign_in_at,
      confirmation_token, recovery_token, email_change, email_change_token_new,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, is_sso_user
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_vistoriador, 'authenticated', 'authenticated',
      'vistoriador@torresvistorias.com.br', crypt(v_pwd, gen_salt('bf')),
      NOW(), NOW(), '', '', '', '',
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'company_id', v_company::text, 'role', 'VISTORIADOR'),
      jsonb_build_object('full_name', 'Vistoriador Demo'),
      NOW(), NOW(), FALSE
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      v_vistoriador, v_vistoriador,
      jsonb_build_object('sub', v_vistoriador::text, 'email', 'vistoriador@torresvistorias.com.br', 'email_verified', true, 'phone_verified', false),
      'email', 'vistoriador@torresvistorias.com.br', NOW(), NOW(), NOW()
    );
  END IF;
END $$;

INSERT INTO public.profiles (id, company_id, full_name, role)
VALUES
  ('11111111-1111-4111-8111-111111111101', '00000000-0000-4000-8000-000000000001', 'Torres Vistorias Admin', 'SUPER_ADMIN'),
  ('11111111-1111-4111-8111-111111111102', '00000000-0000-4000-8000-000000000001', 'Vistoriador Demo', 'VISTORIADOR')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id;

INSERT INTO public.inspections (
  id, company_id, inspector_id, inspection_number,
  inspection_date, inspection_time, location,
  client_name, client_document, client_phone,
  plate, chassis, brand, model, color, fuel,
  manufacture_year, model_year, situation, status, opinion
) VALUES
  (
    '22222222-2222-4222-8222-222222222201',
    '00000000-0000-4000-8000-000000000001',
    '11111111-1111-4111-8111-111111111102',
    1001, CURRENT_DATE - 2, '10:30', 'Torres Vistoria — Unidade Centro',
    'João Silva', '123.456.789-00', '(11) 98765-4321',
    'ABC1D23', '9BWZZZ377VT004251', 'Volkswagen', 'Gol', 'Prata', 'Flex',
    2019, 2020, 'PARTICULAR', 'COMPLETED', 'APROVADO'
  ),
  (
    '22222222-2222-4222-8222-222222222202',
    '00000000-0000-4000-8000-000000000001',
    '11111111-1111-4111-8111-111111111102',
    1002, CURRENT_DATE, '14:00', 'Torres Vistoria — Unidade Centro',
    'Maria Santos', '987.654.321-00', '(11) 91234-5678',
    'XYZ9A87', '9BG116GW04C400001', 'Chevrolet', 'Onix', 'Branco', 'Flex',
    2021, 2022, 'LOJA', 'DRAFT', NULL
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.financial_entries (
  id, company_id, inspection_id, entry_type, description, amount, entry_date, created_by
) VALUES (
  '33333333-3333-4333-8333-333333333301',
  '00000000-0000-4000-8000-000000000001',
  '22222222-2222-4222-8222-222222222201',
  'RECEITA', 'Vistoria cautelar — Gol ABC1D23', 350.00, CURRENT_DATE - 2,
  '11111111-1111-4111-8111-111111111101'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notifications (id, company_id, user_id, title, body, metadata)
VALUES (
  '44444444-4444-4444-8444-444444444401',
  '00000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111101',
  'Ambiente demo pronto',
  'Use admin@torresvistorias.com.br ou vistoriador@torresvistorias.com.br para testar.',
  '{"type": "demo_welcome"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
