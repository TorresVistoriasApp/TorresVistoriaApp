ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

COMMENT ON COLUMN public.companies.location IS 'Cidade/região da empresa (integração futura com mapas)';
COMMENT ON COLUMN public.companies.address IS 'Endereço completo da empresa';
