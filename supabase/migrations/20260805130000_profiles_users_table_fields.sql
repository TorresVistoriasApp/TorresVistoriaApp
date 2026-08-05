-- ETAPA 2 — USUÁRIOS
--
-- A tabela `profiles` já É a "tabela de usuários" do tenant desde a modelagem
-- inicial (20250623000000_initial_schema.sql) e já cumpre a maior parte do
-- pedido:
--   id          -> PK, FK 1:1 para auth.users(id) ON DELETE CASCADE
--   company_id  -> NOT NULL, FK para companies(id) (já obrigatório)
--   full_name   -> equivalente a "name"
--   email
--   avatar_url  -> equivalente a "avatar"
--   role
--   is_active   -> equivalente booleano de "status"
--   created_at / updated_at (+ deleted_at, já usado para soft delete)
--
-- Este migration é aditivo e cobre o que faltava: telefone, um "status"
-- textual explícito e uma coluna gerada auth_user_id (sempre igual a id,
-- sem duplicar dado) só para deixar explícito na spec que profiles.id JÁ é
-- o identificador de auth. Nenhuma coluna existente é removida ou renomeada
-- aqui — full_name/avatar_url/is_active continuam funcionando exatamente
-- como antes para não quebrar nada que já depende deles.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS auth_user_id UUID GENERATED ALWAYS AS (id) STORED;

COMMENT ON COLUMN public.profiles.auth_user_id IS
  'Espelho gerado de id (sempre igual, sem risco de dessincronia). profiles.id já É o id de auth.users desde a modelagem original (FK 1:1 ON DELETE CASCADE); esta coluna só torna isso explícito para a spec multi-tenant.';

-- Backfill de status a partir do estado atual de is_active, sem perda de dado.
UPDATE public.profiles
SET status = CASE WHEN is_active THEN 'ACTIVE' ELSE 'INACTIVE' END
WHERE status IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN status SET DEFAULT 'ACTIVE',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'));

-- Mantém status <-> is_active sincronizados nos dois sentidos: código legado
-- que só conhece is_active continua funcionando sem alteração, e status já
-- passa a ser uma fonte de verdade utilizável a partir de agora (ex.: futuro
-- estado SUSPENDED, que hoje não tem equivalente booleano e é tratado como
-- inativo para fins de is_active).
CREATE OR REPLACE FUNCTION public.sync_profile_status_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS NULL THEN
      NEW.status := CASE WHEN NEW.is_active THEN 'ACTIVE' ELSE 'INACTIVE' END;
    ELSE
      NEW.is_active := (NEW.status = 'ACTIVE');
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.is_active := (NEW.status = 'ACTIVE');
  ELSIF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    NEW.status := CASE WHEN NEW.is_active THEN 'ACTIVE' ELSE 'INACTIVE' END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_status_fields ON public.profiles;
CREATE TRIGGER trg_sync_profile_status_fields
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_status_fields();

CREATE INDEX IF NOT EXISTS idx_profiles_company_status
  ON public.profiles(company_id, status)
  WHERE deleted_at IS NULL;

-- A trigger de bloqueio de auto-escalonamento (20250623000001 /
-- 20260724120000_block_profile_self_escalation.sql) já impede que o próprio
-- usuário altere role/company_id/is_active/email via UPDATE direto. Como
-- status agora espelha is_active, a mesma proteção precisa cobrir status,
-- senão um usuário comum poderia se auto-reativar/desativar contornando a
-- checagem original (que só olhava is_active).
CREATE OR REPLACE FUNCTION public.prevent_profile_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM auth.uid() THEN
    RETURN NEW;
  END IF;

  IF public.is_super_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.company_id IS DISTINCT FROM OLD.company_id
     OR NEW.is_active IS DISTINCT FROM OLD.is_active
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.email IS DISTINCT FROM OLD.email
  THEN
    RAISE EXCEPTION 'Função, empresa, status e e-mail do perfil só podem ser alterados por um administrador.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;
