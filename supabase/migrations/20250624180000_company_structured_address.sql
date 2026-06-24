ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS address_cep TEXT,
  ADD COLUMN IF NOT EXISTS address_street TEXT,
  ADD COLUMN IF NOT EXISTS address_number TEXT,
  ADD COLUMN IF NOT EXISTS address_complement TEXT,
  ADD COLUMN IF NOT EXISTS address_neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_state TEXT;

COMMENT ON COLUMN public.companies.address_cep IS 'CEP da sede (formato 00000-000)';
COMMENT ON COLUMN public.companies.address_street IS 'Logradouro';
COMMENT ON COLUMN public.companies.address_number IS 'Número';
COMMENT ON COLUMN public.companies.address_complement IS 'Complemento';
COMMENT ON COLUMN public.companies.address_neighborhood IS 'Bairro';
COMMENT ON COLUMN public.companies.address_city IS 'Cidade';
COMMENT ON COLUMN public.companies.address_state IS 'UF (2 letras)';
