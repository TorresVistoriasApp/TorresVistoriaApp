-- Fase 3: fecha os buckets que guardam dados pessoais.
--
-- inspection-photos e reports estavam com public = true, e a rota
-- /storage/v1/object/public/ ignora RLS: qualquer pessoa com o caminho baixava
-- foto de veículo (placa, local, GPS) ou o PDF completo do laudo, sem sessão.
--
-- As policies de storage.objects já restringem SELECT ao authenticated da mesma
-- empresa desde 20250623100000 e 20250624130000 — elas só nunca chegaram a valer
-- porque o bucket público curto-circuita a verificação. Fechar o bucket é o que
-- faz essas policies passarem a ter efeito, então nada de novo precisa ser criado.
UPDATE storage.buckets
SET public = false
WHERE id IN ('inspection-photos', 'reports');

-- As URLs públicas gravadas no banco deixam de resolver. O storage_path é a
-- fonte da verdade e o cliente assina na leitura; limpar evita que algum caminho
-- esquecido tente usar uma URL morta.
UPDATE public.inspection_photos
SET public_url = NULL, thumbnail_url = NULL
WHERE public_url LIKE '%/object/public/%'
   OR thumbnail_url LIKE '%/object/public/%';

UPDATE public.inspection_reports
SET public_url = NULL
WHERE public_url LIKE '%/object/public/%';
