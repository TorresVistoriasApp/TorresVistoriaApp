-- Torres Vistoria initial schema v1.0
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(public.get_user_role() = 'SUPER_ADMIN', FALSE);
$$;

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, document TEXT, email TEXT, phone TEXT, logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ,
  CONSTRAINT roles_code_check CHECK (code IN ('SUPER_ADMIN', 'VISTORIADOR'))
);

CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), role_id UUID NOT NULL REFERENCES public.roles(id),
  permission_id UUID NOT NULL REFERENCES public.permissions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ,
  UNIQUE (role_id, permission_id)
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  full_name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'VISTORIADOR', avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ,
  CONSTRAINT profiles_role_check CHECK (role IN ('SUPER_ADMIN', 'VISTORIADOR'))
);

CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL UNIQUE REFERENCES public.companies(id),
  primary_color TEXT NOT NULL DEFAULT '#1e40af', theme_mode TEXT NOT NULL DEFAULT 'light',
  legal_footer TEXT, signature_image_url TEXT, watermark_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES public.companies(id),
  inspector_id UUID NOT NULL REFERENCES public.profiles(id), inspection_number INTEGER NOT NULL,
  inspection_date DATE NOT NULL, inspection_time TIME NOT NULL, location TEXT NOT NULL,
  client_name TEXT NOT NULL, client_document TEXT NOT NULL, client_phone TEXT, client_email TEXT,
  plate TEXT NOT NULL, chassis TEXT NOT NULL, renavam TEXT, brand TEXT NOT NULL, model TEXT NOT NULL,
  version TEXT, color TEXT NOT NULL, fuel TEXT NOT NULL, manufacture_year INTEGER NOT NULL, model_year INTEGER NOT NULL,
  mileage INTEGER, situation TEXT NOT NULL, opinion TEXT, technical_notes TEXT, internal_notes TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ,
  UNIQUE (company_id, inspection_number)
);

CREATE TABLE public.inspection_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES public.companies(id),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  category TEXT NOT NULL, item_name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'NA', notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE public.inspection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES public.companies(id),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  category TEXT NOT NULL, storage_path TEXT NOT NULL, public_url TEXT, file_size INTEGER,
  mime_type TEXT NOT NULL DEFAULT 'image/webp', latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
  exif_metadata JSONB, watermark_applied BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE public.inspection_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES public.companies(id),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id), content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE public.inspection_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES public.companies(id),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1, storage_path TEXT NOT NULL, public_url TEXT,
  verification_code TEXT NOT NULL UNIQUE, integrity_hash TEXT NOT NULL, qr_code_data TEXT,
  generated_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ,
  UNIQUE (inspection_id, version)
);

CREATE TABLE public.financial_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES public.companies(id),
  inspection_id UUID REFERENCES public.inspections(id), entry_type TEXT NOT NULL, description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL, entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID REFERENCES public.companies(id),
  user_id UUID REFERENCES public.profiles(id), action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id UUID,
  old_data JSONB, new_data JSONB, ip_address INET, user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES public.companies(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id), title TEXT NOT NULL, body TEXT NOT NULL,
  read_at TIMESTAMPTZ, metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_profiles_company_id ON public.profiles(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_inspections_company_id ON public.inspections(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_inspections_plate ON public.inspections(plate) WHERE deleted_at IS NULL;

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

INSERT INTO public.companies (id, name, email) VALUES
  ('00000000-0000-4000-8000-000000000001', 'Torres Vistoria', 'contato@torresvistoria.com.br')
ON CONFLICT DO NOTHING;