-- Ciclo de vida da conta B2C: exclusão LGPD com carência de 90 dias e reativação.

-- ---------------------------------------------------------------------------
-- 1. Permite RPCs autorizadas alterarem status de conta
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.prevent_consumer_profile_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF current_setting('app.bypass_consumer_escalation_guard', true) = 'true' THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM auth.uid() THEN
    RETURN NEW;
  END IF;

  IF NEW.account_status IS DISTINCT FROM OLD.account_status
     OR NEW.deletion_requested_at IS DISTINCT FROM OLD.deletion_requested_at
     OR NEW.deletion_scheduled_at IS DISTINCT FROM OLD.deletion_scheduled_at
     OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
  THEN
    RAISE EXCEPTION 'Status de conta e exclusão só podem ser alterados pelo sistema.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_consumer_profile_self_escalation() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Solicitar exclusão (carência de 90 dias)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.request_consumer_account_deletion()
RETURNS public.consumer_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.consumer_profiles;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT * INTO v_profile
  FROM public.consumer_profiles
  WHERE id = auth.uid()
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil de consumidor não encontrado';
  END IF;

  IF v_profile.account_status = 'deleted' THEN
    RAISE EXCEPTION 'Conta já excluída';
  END IF;

  IF v_profile.account_status = 'pending_deletion' THEN
    RETURN v_profile;
  END IF;

  PERFORM set_config('app.bypass_consumer_escalation_guard', 'true', true);

  UPDATE public.consumer_profiles
  SET
    account_status = 'pending_deletion',
    deletion_requested_at = NOW(),
    deletion_scheduled_at = NOW() + INTERVAL '90 days',
    updated_at = NOW()
  WHERE id = auth.uid()
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

REVOKE ALL ON FUNCTION public.request_consumer_account_deletion() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_consumer_account_deletion() TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Reativar conta durante a carência
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.reactivate_consumer_account()
RETURNS public.consumer_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.consumer_profiles;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT * INTO v_profile
  FROM public.consumer_profiles
  WHERE id = auth.uid()
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil de consumidor não encontrado';
  END IF;

  IF v_profile.account_status <> 'pending_deletion' THEN
    RAISE EXCEPTION 'A conta não está programada para exclusão';
  END IF;

  IF v_profile.deletion_scheduled_at IS NOT NULL AND NOW() >= v_profile.deletion_scheduled_at THEN
    RAISE EXCEPTION 'O prazo de recuperação expirou. A conta será excluída em breve.';
  END IF;

  PERFORM set_config('app.bypass_consumer_escalation_guard', 'true', true);

  UPDATE public.consumer_profiles
  SET
    account_status = 'active',
    deletion_requested_at = NULL,
    deletion_scheduled_at = NULL,
    updated_at = NOW()
  WHERE id = auth.uid()
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

REVOKE ALL ON FUNCTION public.reactivate_consumer_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reactivate_consumer_account() TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. Finalizar exclusões vencidas (job diário / manutenção)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.finalize_expired_consumer_accounts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_count INTEGER := 0;
BEGIN
  FOR v_user_id IN
    SELECT id
    FROM public.consumer_profiles
    WHERE account_status = 'pending_deletion'
      AND deletion_scheduled_at IS NOT NULL
      AND deletion_scheduled_at <= NOW()
      AND deleted_at IS NULL
  LOOP
    DELETE FROM auth.users WHERE id = v_user_id;
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_expired_consumer_accounts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalize_expired_consumer_accounts() TO service_role;

-- ---------------------------------------------------------------------------
-- 5. is_consumer() — conta inativa (pending_deletion) não opera consultas
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_consumer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.consumer_profiles
    WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND account_status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION public.is_consumer() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_consumer() TO authenticated;
