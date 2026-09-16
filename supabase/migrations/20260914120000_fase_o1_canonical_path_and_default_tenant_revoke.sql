-- Fase O.1 — endurece path canônico de fotos (paridade com o parser JS da N.2)
-- e revoga EXECUTE de get_default_tenant_id() para papéis de cliente.
--
-- Não altera layout de objetos. Não DROP da função get_default_tenant_id
-- (reversível com GRANT EXECUTE TO authenticated).

CREATE OR REPLACE FUNCTION public.is_canonical_inspection_photo_object_path(p_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT p_name IS NOT NULL
    AND p_name = btrim(p_name)
    AND p_name <> ''
    AND position('\' IN p_name) = 0
    AND position('%' IN p_name) = 0
    AND position('..' IN p_name) = 0
    AND position('//' IN p_name) = 0
    AND position('://' IN p_name) = 0
    AND position('?' IN p_name) = 0
    AND left(p_name, 1) <> '/'
    AND (
      p_name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[A-Za-z0-9][A-Za-z0-9_]{0,80}/[A-Za-z0-9._-]{1,180}\.webp$'
      OR p_name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[A-Za-z0-9][A-Za-z0-9_]{0,80}/thumbs/[A-Za-z0-9._-]{1,180}\.webp$'
    );
$$;

COMMENT ON FUNCTION public.is_canonical_inspection_photo_object_path(TEXT) IS
  'Path canônico de foto: {tenant}/{inspection}/{category}/{file}.webp ou .../thumbs/{file}.webp. Rejeita absoluto, .., %, \\, //, query string.';

REVOKE ALL ON FUNCTION public.get_default_tenant_id() FROM PUBLIC, anon, authenticated;
