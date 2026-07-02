-- Corrige auditoria em companies: a tabela usa "id", não "company_id"
CREATE OR REPLACE FUNCTION public.audit_log_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_company_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'companies' THEN
    v_company_id := COALESCE(NEW.id, OLD.id);
  ELSE
    v_company_id := COALESCE(NEW.company_id, OLD.company_id, public.get_user_company_id());
  END IF;

  INSERT INTO public.audit_logs (company_id, user_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (
    v_company_id,
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;
