-- Campos de gestão de usuários: e-mail, status e troca obrigatória de senha
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND (p.email IS NULL OR p.email = '');

CREATE INDEX IF NOT EXISTS idx_profiles_company_active
  ON public.profiles(company_id, is_active)
  WHERE deleted_at IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_company_id UUID;
  v_role TEXT;
  v_must_change_password BOOLEAN;
BEGIN
  v_company_id := (NEW.raw_app_meta_data->>'company_id')::UUID;
  v_role := COALESCE(NEW.raw_app_meta_data->>'role', 'VISTORIADOR');
  v_must_change_password := COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false);

  IF v_company_id IS NULL THEN
    SELECT id INTO v_company_id FROM public.companies WHERE deleted_at IS NULL ORDER BY created_at LIMIT 1;
  END IF;

  INSERT INTO public.profiles (
    id,
    company_id,
    full_name,
    role,
    email,
    must_change_password,
    is_active
  )
  VALUES (
    NEW.id,
    v_company_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    v_role,
    NEW.email,
    v_must_change_password,
    true
  );

  RETURN NEW;
END;
$$;
