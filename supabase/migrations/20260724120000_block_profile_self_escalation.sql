-- Bloqueia escalonamento de privilégio pelo próprio perfil.
--
-- A policy profiles_update_self (20250623000001) permite UPDATE em qualquer coluna
-- da própria linha, o que tornava possível a um VISTORIADOR se promover a
-- SUPER_ADMIN ou migrar para outra empresa com uma única chamada PostgREST.
-- A policy continua necessária (o usuário edita nome e avatar), então a proteção
-- é feita em nível de coluna por trigger.

CREATE OR REPLACE FUNCTION public.prevent_profile_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Operações do service role (edge functions administrativas) não têm auth.uid().
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Alterações em perfis de terceiros já são restritas à policy profiles_admin.
  IF NEW.id IS DISTINCT FROM auth.uid() THEN
    RETURN NEW;
  END IF;

  -- Super admin pode editar o próprio cadastro sem restrição.
  IF public.is_super_admin() THEN
    RETURN NEW;
  END IF;

  -- deleted_at fica de fora de propósito: anonymize_user_account() roda com o
  -- auth.uid() do próprio titular ao exercer o direito de exclusão da LGPD, e
  -- se auto-excluir não é escalonamento de privilégio.
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.company_id IS DISTINCT FROM OLD.company_id
     OR NEW.is_active IS DISTINCT FROM OLD.is_active
     OR NEW.email IS DISTINCT FROM OLD.email
  THEN
    RAISE EXCEPTION 'Função, empresa, status e e-mail do perfil só podem ser alterados por um administrador.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_profile_self_escalation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS profiles_prevent_self_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_self_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_self_escalation();
