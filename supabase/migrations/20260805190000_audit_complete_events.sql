-- ETAPA 12 — AUDITORIA completa
--
-- • Captura IP e User-Agent em todos os eventos
-- • RPC record_audit_event para LOGIN, LOGOUT, EXPORT_PDF, EXPORT_EXCEL
-- • Triggers adicionais em inspection_types e notifications

-- ---------------------------------------------------------------------------
-- 1. Helpers de contexto HTTP (PostgREST / Supabase)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_request_ip()
RETURNS INET
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    split_part(
      COALESCE(
        NULLIF(current_setting('request.headers', true), '')::json->>'x-forwarded-for',
        NULLIF(current_setting('request.headers', true), '')::json->>'x-real-ip'
      ),
      ',',
      1
    ),
    ''
  )::INET;
$$;

CREATE OR REPLACE FUNCTION public.get_request_user_agent()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    NULLIF(current_setting('request.headers', true), '')::json->>'user-agent',
    ''
  );
$$;

REVOKE ALL ON FUNCTION public.get_request_ip() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_request_user_agent() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_request_ip() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_request_user_agent() TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Trigger genérico — inclui IP, UA e created_by
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_log_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'companies' THEN
    v_company_id := COALESCE(NEW.id, OLD.id);
  ELSE
    v_company_id := COALESCE(NEW.company_id, OLD.company_id, public.get_user_company_id());
  END IF;

  INSERT INTO public.audit_logs (
    company_id,
    user_id,
    created_by,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data,
    ip_address,
    user_agent
  )
  VALUES (
    v_company_id,
    auth.uid(),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN public.redact_audit_jsonb(to_jsonb(OLD)) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN public.redact_audit_jsonb(to_jsonb(NEW)) END,
    public.get_request_ip(),
    public.get_request_user_agent()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. RPC para eventos de aplicação (não-DML)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_audit_event(
  p_action TEXT,
  p_entity_type TEXT DEFAULT 'app',
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_company_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticação necessária';
  END IF;

  IF p_action NOT IN ('LOGIN', 'LOGOUT', 'EXPORT_PDF', 'EXPORT_EXCEL') THEN
    RAISE EXCEPTION 'Ação de auditoria inválida: %', p_action;
  END IF;

  v_company_id := public.get_user_company_id();

  INSERT INTO public.audit_logs (
    company_id,
    user_id,
    created_by,
    action,
    entity_type,
    entity_id,
    new_data,
    ip_address,
    user_agent
  )
  VALUES (
    v_company_id,
    auth.uid(),
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_metadata,
    public.get_request_ip(),
    public.get_request_user_agent()
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_audit_event(TEXT, TEXT, UUID, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_audit_event(TEXT, TEXT, UUID, JSONB) TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. Triggers adicionais
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_audit_inspection_types ON public.inspection_types;
CREATE TRIGGER trg_audit_inspection_types
  AFTER INSERT OR UPDATE OR DELETE ON public.inspection_types
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

DROP TRIGGER IF EXISTS trg_audit_notifications ON public.notifications;
CREATE TRIGGER trg_audit_notifications
  AFTER INSERT OR UPDATE OR DELETE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

-- Índice para filtros por ação
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_action_created
  ON public.audit_logs(company_id, action, created_at DESC)
  WHERE deleted_at IS NULL;
