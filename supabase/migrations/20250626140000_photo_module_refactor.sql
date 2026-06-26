-- Refatoração do módulo de fotos e evidências
-- Prepara arquitetura SaaS com seções/categorias configuráveis e metadados estendidos

-- Tabelas de configuração (Super Admin futuro)
CREATE TABLE IF NOT EXISTS public.photo_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'camera',
  sort_order INTEGER NOT NULL DEFAULT 0,
  min_required_count INTEGER NOT NULL DEFAULT 0,
  max_allowed_count INTEGER NOT NULL DEFAULT 999,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE NULLS NOT DISTINCT (company_id, key)
);

CREATE TABLE IF NOT EXISTS public.photo_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  section_id UUID REFERENCES public.photo_sections(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'camera',
  sort_order INTEGER NOT NULL DEFAULT 0,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  min_count INTEGER NOT NULL DEFAULT 1,
  max_count INTEGER NOT NULL DEFAULT 1,
  category_type TEXT NOT NULL DEFAULT 'SINGLE',
  visual_guide JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT photo_categories_type_check CHECK (
    category_type IN ('SINGLE', 'MULTI', 'DAMAGE', 'COMPLEMENTARY')
  ),
  UNIQUE NULLS NOT DISTINCT (company_id, key)
);

-- Metadados estendidos em inspection_photos
ALTER TABLE public.inspection_photos
  ADD COLUMN IF NOT EXISTS section_key TEXT,
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS width INTEGER,
  ADD COLUMN IF NOT EXISTS height INTEGER,
  ADD COLUMN IF NOT EXISTS resolution TEXT,
  ADD COLUMN IF NOT EXISTS gps_accuracy DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS captured_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS device_model TEXT,
  ADD COLUMN IF NOT EXISTS device_os TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'CAPTURED',
  ADD COLUMN IF NOT EXISTS damage_location TEXT,
  ADD COLUMN IF NOT EXISTS damage_category TEXT,
  ADD COLUMN IF NOT EXISTS damage_severity TEXT,
  ADD COLUMN IF NOT EXISTS complementary_name TEXT,
  ADD COLUMN IF NOT EXISTS complementary_category TEXT,
  ADD COLUMN IF NOT EXISTS ai_validation JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.inspection_photos
  DROP CONSTRAINT IF EXISTS inspection_photos_status_check;

ALTER TABLE public.inspection_photos
  ADD CONSTRAINT inspection_photos_status_check CHECK (
    status IS NULL OR status IN (
      'PENDING', 'CAPTURED', 'UPLOADING', 'VALIDATED', 'NEEDS_RETAKE', 'REJECTED'
    )
  );

CREATE INDEX IF NOT EXISTS idx_inspection_photos_section
  ON public.inspection_photos(inspection_id, section_key)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_inspection_photos_category
  ON public.inspection_photos(inspection_id, category)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_inspection_photos_hash
  ON public.inspection_photos(content_hash)
  WHERE deleted_at IS NULL AND content_hash IS NOT NULL;

-- RLS para tabelas de configuração
ALTER TABLE public.photo_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY photo_sections_tenant ON public.photo_sections
  FOR ALL USING (
    public.is_super_admin()
    OR company_id IS NULL
    OR company_id = public.get_user_company_id()
  );

CREATE POLICY photo_categories_tenant ON public.photo_categories
  FOR ALL USING (
    public.is_super_admin()
    OR company_id IS NULL
    OR company_id = public.get_user_company_id()
  );

CREATE TRIGGER photo_sections_updated_at
  BEFORE UPDATE ON public.photo_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER photo_categories_updated_at
  BEFORE UPDATE ON public.photo_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Migração de dados existentes: preenche section_key a partir de category legada
UPDATE public.inspection_photos
SET section_key = CASE
  WHEN category IN ('DOCUMENTOS', 'DOC_VEICULO', 'DOC_CRLV', 'DOC_CRV', 'DOC_ATPV_E', 'DOC_OUTROS') THEN 'DOCUMENTACAO'
  WHEN category LIKE 'PINT_%' OR category LIKE 'PINTURA_%' THEN 'PINTURA'
  WHEN category IN ('DANOS', 'AVARIA') THEN 'AVARIAS'
  WHEN category IN ('EXTRAS', 'COMPLEMENTAR') THEN 'COMPLEMENTARES'
  WHEN category LIKE 'EXT_%' OR category IN (
    'FRENTE_45_ESQUERDA', 'FRENTE_45_DIREITA', 'TRASEIRA_45_ESQUERDA', 'TRASEIRA_45_DIREITA',
    'LATERAL_ESQUERDA', 'LATERAL_DIREITA', 'PLACA_DIANTEIRA', 'PLACA_TRASEIRA'
  ) THEN 'IDENTIFICACAO_EXTERNA'
  WHEN category LIKE 'MOT_%' OR category IN ('MOTOR', 'MOTOR_NUMERO', 'ESTRUTURA_DIANTEIRA') THEN 'COMPARTIMENTO_MOTOR'
  WHEN category LIKE 'TRS_%' OR category IN ('ASSOALHO_PORTA_MALAS', 'ESTRUTURA_TRASEIRA') THEN 'ESTRUTURA_TRASEIRA'
  WHEN category LIKE 'LAT_%' OR category = 'CAIXA_AR' THEN 'ESTRUTURA_LATERAL'
  WHEN category LIKE 'IDV_%' OR category IN ('CHASSI', 'VIDROS', 'ETIQUETAS') THEN 'IDENTIFICACAO_VEICULO'
  WHEN category LIKE 'INT_%' OR category IN ('PAINEL', 'HODOMETRO', 'INTERIOR') THEN 'INTERIOR'
  WHEN category LIKE 'SEG_%' OR category = 'CINTOS_AIRBAGS' THEN 'SEGURANCA'
  WHEN category LIKE 'ROD_%' THEN 'RODAS_PNEUS'
  ELSE 'IDENTIFICACAO_EXTERNA'
END
WHERE section_key IS NULL AND deleted_at IS NULL;

UPDATE public.inspection_photos
SET status = 'CAPTURED'
WHERE status IS NULL AND deleted_at IS NULL;

UPDATE public.inspection_photos
SET captured_at = created_at
WHERE captured_at IS NULL AND deleted_at IS NULL;
