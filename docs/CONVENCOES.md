# Convenções do Projeto — Torres Vistoria

Guia de padrões de código, arquitetura e fluxo de trabalho para contribuidores.

## Stack

- React 19 + TypeScript (strict)
- Vite 6 + TailwindCSS 4
- shadcn/ui + Radix UI
- React Query v5 + Zustand
- React Hook Form + Zod
- PostgreSQL + Auth + Storage (backend)
- Recharts + pdfmake + ExcelJS

## Estilo de código

- Named exports ONLY (sem default exports)
- Imports absolutos com prefixo `@/`
- Componentes funcionais + hooks
- TypeScript strict mode (sem `any`)
- Early returns para reduzir aninhamento
- Componentes com menos de 150 linhas (extrair lógica para hooks)
- JSDoc para funções complexas
- `const`/`let`, nunca `var`

## Padrões

- **Auth:** React Context (`auth-context`) + `auth-service` — não duplicar em Zustand persist
- **Server state:** React Query (hooks + services)
- **Client UI state:** Zustand (`ui-store`, `inspection-store` para drafts)
- **Backend client:** `src/lib/db-client.ts` (export `db`)
- Forms: React Hook Form + Zod
- Mobile-first responsive design
- Loading states e error boundaries
- Toasts via `useToast()` + `ToastViewport` em `AppProviders`

## Segurança

- RLS policies em TODAS as tabelas
- Validação Zod em TODOS os inputs
- Nunca commitar secrets — usar `.env.local`
- Role/company em `app_metadata` (nunca `user_metadata` em RLS)
- Variáveis `VITE_*` são públicas no bundle — apenas chaves anon/public

## Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `VistoriaCard` |
| Hooks | camelCase com prefixo `use-` | `useInspections` |
| Services | kebab-case com sufixo `-service` | `inspection-service` |
| Schemas | camelCase | `vistoriaSchema` |
| Arquivos | kebab-case | `vistoria-form.tsx` |

## Banco de dados

- Migrations em `supabase/migrations/`
- Tipos TypeScript: `npm run db:types` (requer `DB_PROJECT_ID`)
- Migrations locais: `npm run db:migrate`
- Validar políticas RLS após alterações de schema

## Layout

- `AppShell` compõe `Header`, `Sidebar`, `MobileNav`, `MobileDrawer`
- Nav items centralizados em `src/lib/nav-items.ts`

## Roadmap Fase 1

Auth → Dashboard → Vistorias → Fotos → Checklist → PDF → Financeiro → Deploy
