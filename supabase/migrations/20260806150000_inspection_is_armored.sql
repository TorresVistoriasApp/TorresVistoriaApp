-- Flag de veículo blindado — controla seção de fotos de blindagem na vistoria.
ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS is_armored BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN inspections.is_armored IS
  'Indica veículo blindado; habilita captura de fotos de blindagem no fluxo da vistoria.';
