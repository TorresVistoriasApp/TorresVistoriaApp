-- Expande auditoria para cobrir mais entidades do sistema (governança completa)

DROP TRIGGER IF EXISTS trg_audit_profiles ON public.profiles;
CREATE TRIGGER trg_audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

DROP TRIGGER IF EXISTS trg_audit_settings ON public.settings;
CREATE TRIGGER trg_audit_settings AFTER INSERT OR UPDATE OR DELETE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

DROP TRIGGER IF EXISTS trg_audit_companies ON public.companies;
CREATE TRIGGER trg_audit_companies AFTER INSERT OR UPDATE OR DELETE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

DROP TRIGGER IF EXISTS trg_audit_reports ON public.inspection_reports;
CREATE TRIGGER trg_audit_reports AFTER INSERT OR UPDATE OR DELETE ON public.inspection_reports
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

DROP TRIGGER IF EXISTS trg_audit_photos ON public.inspection_photos;
CREATE TRIGGER trg_audit_photos AFTER INSERT OR UPDATE OR DELETE ON public.inspection_photos
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

DROP TRIGGER IF EXISTS trg_audit_checklists ON public.inspection_checklists;
CREATE TRIGGER trg_audit_checklists AFTER INSERT OR UPDATE OR DELETE ON public.inspection_checklists
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

DROP TRIGGER IF EXISTS trg_audit_comments ON public.inspection_comments;
CREATE TRIGGER trg_audit_comments AFTER INSERT OR UPDATE OR DELETE ON public.inspection_comments
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();
