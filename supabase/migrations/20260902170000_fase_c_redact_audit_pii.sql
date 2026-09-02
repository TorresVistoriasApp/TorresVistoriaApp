-- Fase C — redigir mais PII nos snapshots de auditoria.
-- buyer_document / seller_document / cpf / cnpj / document_hash / document_tail
-- não estavam na lista original de redact_audit_jsonb.

CREATE OR REPLACE FUNCTION public.redact_audit_jsonb(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  result JSONB := payload;
  key TEXT;
  sensitive TEXT[] := ARRAY[
    'client_document', 'client_phone', 'client_email', 'client_name',
    'buyer_document', 'seller_document', 'buyer_name', 'seller_name',
    'chassis', 'renavam', 'plate', 'email', 'phone', 'document',
    'cpf', 'cnpj', 'document_hash', 'document_tail',
    'latitude', 'longitude', 'gps_accuracy', 'exif_metadata',
    'internal_notes', 'password', 'recovery_token', 'access_token', 'refresh_token'
  ];
BEGIN
  IF result IS NULL OR jsonb_typeof(result) <> 'object' THEN
    RETURN result;
  END IF;

  FOREACH key IN ARRAY sensitive LOOP
    IF result ? key THEN
      result := jsonb_set(result, ARRAY[key], to_jsonb('[redacted]'::text), true);
    END IF;
  END LOOP;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.redact_audit_jsonb(JSONB) FROM PUBLIC, anon, authenticated;
