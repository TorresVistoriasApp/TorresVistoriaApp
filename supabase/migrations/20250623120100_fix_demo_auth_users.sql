-- Corrige auth de usuários demo criados via SQL (login GoTrue)

UPDATE auth.users SET
  confirmation_token = '',
  recovery_token = '',
  email_change = '',
  email_change_token_new = '',
  email_change_token_current = '',
  reauthentication_token = '',
  phone_change = '',
  phone_change_token = '',
  email_change_confirm_status = 0
WHERE email IN ('admin@torresvistorias.com.br', 'vistoriador@torresvistorias.com.br');

UPDATE auth.identities i SET
  provider_id = u.email,
  identity_data = jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'phone_verified', false
  )
FROM auth.users u
WHERE i.user_id = u.id AND i.provider = 'email';
