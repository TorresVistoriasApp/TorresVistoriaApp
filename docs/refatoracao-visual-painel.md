# Refatoração visual do painel Torres Vistorias

Plano de execução para alinhar o painel logado (`/dashboard` e demais páginas internas) à linguagem visual da landing da Torres Consulta.

**Público deste documento:** o Composer executa fase por fase, na ordem. Cada passo tem arquivos-alvo, o que fazer e critério de aceite.

---

## 1. Diagnóstico

### O que a landing faz certo (referência)

A landing (`src/modules/torres-consulta/components/landing/*`) tem uma linguagem visual **plana, sóbria e tokenizada**:

- Superfícies sólidas: `bg-card` sobre `bg-canvas`, borda de 1px `border-border`, sombra sutil `--shadow-card`.
- Zero decoração: sem glow, sem halo, sem gradiente em card, sem blur. A regra está escrita no topo de `src/styles/globals.css` (linhas 4–8): *"nunca usar backdrop-filter, filter: blur() ou animações infinitas"*.
- Hierarquia tipográfica em vez de caixas coloridas: eyebrow uppercase primary → título bold com `text-balance` → corpo `text-muted-foreground` com `text-pretty`.
- Uma única cor de destaque: laranja `--color-primary: #e2570c`, com variações semânticas `brand-subtle` / `brand-muted` / `brand-emphasis`.
- Primitivos reutilizados: `LandingCard`, `LandingBadge`, `LandingEyebrow`, `LandingIconBox`, `LandingSection` (`landing-ui.tsx`).
- Grid hairline: `grid gap-px bg-border` com filhos `bg-card` — divisórias perfeitas de 1px, sem bordas duplas (`benefits-section.tsx:45`).
- Movimento restrito a `opacity` e `transform`, 180–400ms, easing `--ease-out-quart`.

### O que o painel faz errado

| Problema | Onde | Impacto |
|---|---|---|
| KPI cards com 4 temas de cor por índice (laranja/âmbar/esmeralda/cinza), 2 glows `blur-3xl`, halo gradiente, barra de acento no topo e ring branco | `src/shared/components/charts/kpi-card.tsx:4-29,68-119` | É o maior ruído visual do painel; contradiz a paleta monocromática da marca e viola a regra anti-blur |
| Números de KPI sem `tabular-nums` | `kpi-card.tsx:128` | Dígitos com larguras diferentes desalinham a comparação entre cartões |
| `backdrop-blur-xl` no header, mobile nav, drawer e dialog | `header.tsx:29`, `mobile-nav.tsx`, `mobile-drawer.tsx`, `dialog.tsx` | Viola a regra do próprio design system; custo de composição em mobile |
| Estado ativo da sidebar com `shadow-sm ring-1 ring-primary/15` | `sidebar-nav.tsx:42` | Padrão não existe na landing; produz halo duplo com a borda |
| Opacidades arbitrárias: `border-border/50`, `/60`, `/70`, `bg-muted/20`, `/30`, `/60`, `/80`, `bg-primary/[0.03]`, `/10`, `/12`, `/15` | shell, charts, listas | Impossível manter consistência; a landing usa a cor cheia do token |
| Raios fora da escala: `rounded-[1.15rem]`, `rounded-[0.9rem]`, mistura de `rounded-lg/xl/2xl` | `kpi-card.tsx`, `header.tsx:62`, `sidebar-profile.tsx:25` | Escala definida em `@theme` (linhas 44–48) é ignorada |
| Cores dos gráficos hardcoded e divergentes do tema: `#EA580C` ≠ `#e2570c`, `grid: #E2E8F0` ≠ `#e4e7eb`, tooltip com sombra laranja | `src/shared/lib/chart-theme.ts` | Gráficos parecem de outro produto |
| `tailwind.config.ts` com `primary: #1e40af` (azul) e fonte Inter | `tailwind.config.ts` | Não afeta runtime (Tailwind v4 lê `@theme`), mas engana quem lê o repo e o shadcn CLI usa esse arquivo |
| `font-display` usado sem estar definido | `notification-bell.tsx`, `dialog.tsx` | Cai em fallback silencioso |

### Princípio da refatoração

> Um único sistema de superfícies, uma única cor de destaque, hierarquia por tipografia e espaço. Nada de decoração que não carregue informação.

---

## 2. Regras invioláveis

O Composer deve respeitar em **todos** os passos:

1. **Zero mudança de comportamento.** Nenhuma alteração em hooks, queries, tipos, rotas, permissões ou lógica de dados. A refatoração é exclusivamente de markup e CSS.
2. **Zero dependência nova.** Sem `framer-motion`, sem biblioteca de ícones adicional, sem plugin Tailwind.
3. **Nenhum arquivo da landing é modificado**, exceto o aliasing de classes em `globals.css` descrito no Passo 1.2.
4. **Proibido:** `backdrop-blur-*`, `blur-*`, `filter`, animação infinita, gradiente em card, `shadow-[...]` arbitrária, cor hex inline em JSX.
5. **Cores apenas por token semântico.** Permitido: `primary`, `primary-hover`, `brand-subtle`, `brand-muted`, `brand-emphasis`, `foreground`, `muted`, `muted-foreground`, `subtle-foreground`, `card`, `canvas`, `border`, `border-strong`, `success`, `warning`, `destructive`, `ink*`. Proibido: `orange-*`, `amber-*`, `emerald-*`, `slate-*`, `stone-*`, `red-*` do Tailwind.
6. **Opacidade de cor só quando indispensável**, e restrita a `/10` (fundo) e `/25` (borda). Preferir sempre `brand-subtle` a `primary/10`.
7. **Raio apenas da escala:** `rounded-md` (0.625rem), `rounded-lg` (0.875rem), `rounded-xl` (1.125rem), `rounded-2xl` (1.375rem), `rounded-full`. Nunca valor arbitrário.
8. **Sombra apenas dos tokens:** `shadow-soft`, `shadow-card`, `shadow-elevated`.
9. Após cada fase: `npx tsc --noEmit` e conferir lints dos arquivos tocados. Fase não fecha com erro.
10. Um commit por fase, mensagem no formato `refactor(ui): <fase>`.

---

## 3. Fases

### Progresso

| Fase | Status |
|---|---|
| 1 — Fundação | Concluída |
| 2 — Shell | Concluída |
| 3 — PageHeader | Concluída |
| 4 — KPI cards | Concluída |
| 5 — Cards de gráfico | Concluída |
| 6 — Lista de vistorias | Concluída |
| 7 — Composição do dashboard | Concluída |
| 8 — Varredura de consistência | Pendente |
| 9 — Demais páginas | Pendente |

Desvios e correções feitas durante a execução das Fases 2–7:

- **Offsets de sticky quebrados pela altura do header.** Subir o header de `h-14` para `h-16` desalinhou dois elementos fixos: `inspection-wizard-shell.tsx` (`lg:top-14`) e `avaliacao-tecnica-panel.tsx` (`top-14 sm:top-[3.75rem]`). Ambos foram para `top-16`. Qualquer novo elemento sticky sob o header deve usar `top-16`.
- **`inspection-wizard-shell.tsx` deixou de usar `.page-header-strip`.** Aquela barra é sticky e dependia da classe ser um card; com `.page-header-strip` virando um bloco sem caixa, ela ficaria sem fundo ao grudar no topo. Passou a usar `ui-panel px-5 py-4 sm:px-6`.
- **`.kpi-card` e `.kpi-card-value` foram removidas do `globals.css`** — ficaram órfãs após a reescrita do `KpiCard`.
- **`SyncStatusIndicator` e `VistoriaStatusBadge` tokenizados** fora do escopo previsto: o primeiro aparece no header e usava `emerald-500`/`amber-400`/`sky-500`/`red-500` com `animate-pulse` infinito; o segundo aparece na lista do dashboard.
- **`card.tsx`, `reports-results.tsx`, `dropdown-menu.tsx` e `lgpd-consent-banner.tsx`** migraram para `ui-panel` / `ui-panel-elevated` para permitir remover `.surface-interactive` do CSS (Passo 6.2).
- `.surface` e `.surface-elevated` continuam existindo como alias, ainda usados em `tenant-guard.tsx`, `consulta-feature-gate.tsx` e `vistoria-filters.tsx`. Migrar na Fase 8.

### Fase 1 — Fundação: sistema de superfícies unificado

> **Status: concluída.** `tsc`, `lint` e `build` limpos. Os passos abaixo ficam como registro do que foi feito — não reexecutar.

Objetivo: uma única definição CSS servindo landing e painel, para que o painel herde o padrão em vez de reimplementá-lo.

Notas da execução:

- `font-display` aparecia em **três** arquivos, não dois: `notification-bell.tsx`, `dialog.tsx` e `core/compliance/components/lgpd-consent-banner.tsx`. Todos corrigidos.
- `#64748B` permanece em `src/modules/torres-vistoria/domain/photos/illustrations/tokens.ts` — são tokens de ilustração SVG para o laudo, fora do escopo dos gráficos.
- `.surface-interactive` ganhou `min-w-0 max-w-full` (não tinha) e seu `:hover` passou para dentro de `@media (hover: hover)`, eliminando hover preso em toque.

#### Passo 1.1 — Auditar o baseline

- Rodar `npx tsc --noEmit` e registrar o resultado (precisa estar limpo antes de começar).
- Capturar o estado atual do `/dashboard` em 375px, 768px, 1280px e 1920px para comparação posterior.
- **Aceite:** baseline sem erros de tipo registrado.

#### Passo 1.2 — Criar o bloco de classes unificadas em `globals.css`

Arquivo: `src/styles/globals.css`

Dentro de `@layer utilities`, substituir o bloco `/* ---------- Superfícies base (app interno) ---------- */` (linhas 139–162) por um bloco unificado. As classes da landing passam a ser seletores irmãos das do app — mesma declaração, zero mudança visual na landing:

```css
/* ---------- Superfícies unificadas (app + landing) ---------- */

.ui-panel,
.surface,
.landing-card {
  @apply min-w-0 max-w-full rounded-xl border border-border bg-card text-card-foreground;
  box-shadow: var(--shadow-card);
}

.ui-panel-elevated,
.surface-elevated {
  @apply min-w-0 rounded-xl border border-border bg-card text-card-foreground;
  box-shadow: var(--shadow-elevated);
}

.ui-panel-interactive,
.surface-interactive,
.landing-card-interactive {
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s var(--ease-out-quart);
}

@media (hover: hover) {
  .ui-panel-interactive:hover,
  .surface-interactive:hover {
    border-color: var(--color-border-strong);
    box-shadow: var(--shadow-elevated);
  }
}
```

Atenção: `.surface-interactive` hoje **não** aplica `.surface`; ela redeclara borda e fundo. Após esta mudança, `.surface-interactive` passa a ser só a camada de transição. Portanto todo consumidor de `.surface-interactive` precisa receber `.ui-panel` junto — isso é feito nos passos 5.1 e 6.1. Para não quebrar nada no intervalo, manter temporariamente `.surface-interactive` na lista de seletores de `.ui-panel` e remover essa duplicação no fim da Fase 6.

Ainda em `@layer utilities`, adicionar os primitivos que o painel vai consumir:

```css
/* ---------- Primitivos de conteúdo ---------- */

.ui-panel-header {
  @apply flex items-start justify-between gap-3 border-b border-border px-5 py-4 md:px-6;
}

.ui-panel-body {
  @apply p-5 md:p-6;
}

.ui-eyebrow,
.landing-eyebrow {
  @apply inline-flex items-center gap-2 text-xs font-bold uppercase;
  letter-spacing: 0.09em;
  color: var(--color-primary);
}

/* Rótulo de métrica / seção — discreto, sem cor de marca */
.ui-microlabel {
  @apply text-[10px] font-bold uppercase;
  letter-spacing: 0.08em;
  color: var(--color-subtle-foreground);
}

/* Número de destaque: tabular para alinhar colunas de KPI */
.ui-metric {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
}

/* Grid de divisórias de 1px, sem bordas duplas (padrão benefits-section) */
.ui-grid-hairline {
  @apply grid gap-px overflow-hidden rounded-xl border border-border;
  background-color: var(--color-border);
  box-shadow: var(--shadow-card);
}

.ui-icon-box,
.landing-icon-box {
  @apply flex shrink-0 items-center justify-center rounded-lg border;
  border-color: #f9d7bf;
  background-color: var(--color-brand-subtle);
  color: var(--color-primary);
}

.ui-icon-box-neutral,
.landing-icon-box-neutral {
  border-color: var(--color-border);
  background-color: var(--color-muted);
  color: var(--color-muted-foreground);
}

.ui-badge,
.landing-badge {
  @apply inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold;
  border-color: #f7cdae;
  background-color: var(--color-brand-subtle);
  color: var(--color-brand-emphasis);
  letter-spacing: -0.005em;
}

/* Chip de variação — success/destructive por token */
.ui-chip-positive {
  @apply inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold;
  border-color: rgb(15 157 110 / 0.25);
  background-color: rgb(15 157 110 / 0.1);
  color: var(--color-success);
}

.ui-chip-negative {
  @apply inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold;
  border-color: rgb(220 38 38 / 0.25);
  background-color: rgb(220 38 38 / 0.1);
  color: var(--color-destructive);
}
```

Remover as declarações agora duplicadas de `.landing-card`, `.landing-card-interactive`, `.landing-eyebrow`, `.landing-icon-box`, `.landing-icon-box-neutral`, `.landing-badge` do bloco `/* ---------- Landing / marketing ---------- */` (linhas 215–278), preservando `.landing-badge-neutral`, `.landing-badge-ink` e `.landing-card-featured`.

- **Aceite:** landing (`/`) visualmente idêntica à captura anterior; `npm run build` passa; nenhuma classe `.landing-*` usada em JSX deixou de existir (confirmar com busca por `landing-` no CSS vs. no JSX).

#### Passo 1.3 — Alinhar `chart-theme.ts` aos tokens

Arquivo: `src/shared/lib/chart-theme.ts`

Substituir a paleta por valores idênticos aos tokens de `@theme`:

```ts
export const CHART_COLORS = {
  primary: "#e2570c",
  primaryLight: "#f97316",
  primaryDark: "#b4400a",
  primarySoft: "#fff5ed",
  neutral: "#10151c",
  neutralMid: "#5c6672",
  neutralLight: "#8a939e",
  amber: "#d97706",
  grid: "#e4e7eb",
  gridDark: "#2b3644",
  tooltipBorder: "#e4e7eb",
  surface: "#ffffff",
  success: "#0f9d6e",
  danger: "#dc2626",
} as const;

export const CHART_SERIES_PALETTE = [
  "#e2570c", // primary
  "#131a23", // ink
  "#d97706", // warning
  "#b4400a", // brand-emphasis
  "#8a939e", // subtle-foreground
  "#f97316", // accent
] as const;
```

Ajustar `chartTooltipStyle` para usar a sombra do sistema em vez do glow laranja:

```ts
export const chartTooltipStyle = {
  contentStyle: {
    borderRadius: "1.125rem",
    border: `1px solid ${CHART_COLORS.tooltipBorder}`,
    backgroundColor: CHART_COLORS.surface,
    boxShadow: "0 2px 4px rgb(16 21 28 / 0.04), 0 12px 28px rgb(16 21 28 / 0.08)",
    fontSize: "13px",
    padding: "10px 14px",
  },
  labelStyle: { fontWeight: 700, color: CHART_COLORS.neutral, marginBottom: 4 },
  itemStyle: { color: CHART_COLORS.neutralMid, fontWeight: 600 },
  cursor: { stroke: CHART_COLORS.neutralLight, strokeWidth: 1, strokeDasharray: "4 4" },
};

export const chartAxisStyle = {
  tick: { fontSize: 11, fill: CHART_COLORS.neutralLight, fontWeight: 600 },
  axisLine: false as const,
  tickLine: false as const,
};
```

- **Aceite:** buscar por `#EA580C`, `#64748B`, `#E2E8F0`, `#292524`, `#57534E`, `#A8A29E`, `#FED7AA`, `#16A34A`, `#78716C`, `#9A3412`, `#FB923C`, `#C2410C`, `#FFEDD5` no `src/` e não encontrar nada fora de arquivos de PDF.

#### Passo 1.4 — Sincronizar `tailwind.config.ts` e resolver `font-display`

Arquivos: `tailwind.config.ts`, `src/layouts/components/notification-bell.tsx`, `src/shared/ui/dialog.tsx`

- Não deletar `tailwind.config.ts` (o `components.json` do shadcn aponta para ele). Corrigir os valores divergentes: `fontFamily.sans` para `"Plus Jakarta Sans"` e `colors.primary` para `#e2570c`; alinhar `borderRadius` à escala de `@theme` (sm `0.375rem`, md `0.625rem`, lg `0.875rem`, xl `1.125rem`, 2xl `1.375rem`). Adicionar comentário no topo indicando que a fonte de verdade é `src/styles/globals.css`.
- Remover as ocorrências de `font-display` (classe inexistente) — trocar por nada, já que `font-sans` é herdada do `body`.

- **Aceite:** busca por `font-display` no `src/` retorna zero; `tailwind.config.ts` sem cor azul nem Inter.

---

### Fase 2 — Shell do painel

Objetivo: sidebar, header e navegação mobile com o mesmo peso visual da landing — superfícies sólidas, bordas cheias, estado ativo por `brand-subtle`.

#### Passo 2.1 — Sidebar: item de navegação

Arquivo: `src/layouts/components/sidebar-nav.tsx`

Substituir o estado ativo (linhas 29–46). Novo padrão:

- Container: `flex items-center rounded-lg text-sm font-semibold transition-colors duration-150`.
- Expandido: `gap-2.5 px-2.5 py-2`.
- Ativo: `bg-brand-subtle text-brand-emphasis`. **Remover** `shadow-sm` e `ring-1 ring-primary/15`.
- Inativo: `text-muted-foreground hover:bg-muted hover:text-foreground` (sem `/80`).
- Colapsado ativo: `bg-brand-subtle text-primary`; inativo igual ao expandido.
- Caixa do ícone (linhas 53–60): usar `ui-icon-box h-8 w-8` quando ativo e `ui-icon-box-neutral h-8 w-8` quando inativo, no lugar de `bg-primary/15` / `bg-muted/60`.
- Rótulo de seção (linha 81): trocar `text-[10px] font-bold uppercase tracking-widest text-muted-foreground` por `ui-microlabel`.
- Separadores de seção (linha 77): trocar `border-border/60` por `border-border`.

- **Aceite:** item ativo é um bloco laranja-claro chapado, sem halo; separadores com 1px cheio.

#### Passo 2.2 — Sidebar: perfil e rodapé

Arquivos: `src/layouts/components/sidebar-profile.tsx`, `src/layouts/components/sidebar.tsx`, `src/layouts/components/sidebar-collapse-toggle.tsx`

- `sidebar-profile.tsx:25`: `rounded-2xl bg-muted/60 p-3` → `rounded-lg border border-border bg-muted p-3`.
- `sidebar.tsx:51`: `border-border/60` → `border-border`; o texto de versão passa a `ui-microlabel`.
- `sidebar-collapse-toggle.tsx`: remover `ring-1 ring-primary/10` e `shadow-sm`; usar `h-8 w-8 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground`.

- **Aceite:** sidebar sem nenhum `ring-*` e sem opacidade em borda.

#### Passo 2.3 — Header

Arquivo: `src/layouts/components/header.tsx`

- Linha 29: remover `md:bg-card/80 md:backdrop-blur-xl` e `max-md:transform-gpu`. Resultado: `border-b border-border bg-card`.
- Linha 30: altura `h-14` → `h-16`, alinhando ao header da landing. Atualizar o spacer mobile da linha 92 para `h-16`.
- Padding horizontal: `px-3 sm:px-4 lg:px-8` → `px-4 sm:px-6 lg:px-8` (mesmo ritmo do container da landing).
- Botão de conta (linhas 61–66): `rounded-2xl border border-border/60 bg-muted/30` → `rounded-lg border border-border bg-card hover:bg-muted`; remover `focus-visible:ring-primary/30` (o `:focus-visible` global de `globals.css:96` já resolve); estado aberto → `data-[state=open]:bg-muted`.
- `ProductCrossLink` (linha 51): `rounded-xl border border-border/60 bg-muted/30` → `rounded-lg border border-border bg-card`.

- **Aceite:** header opaco, sem blur, 64px de altura, sem salto de layout no mobile.

#### Passo 2.4 — Navegação mobile e drawer

Arquivos: `src/layouts/components/mobile-nav.tsx`, `src/layouts/components/mobile-drawer.tsx`, `src/layouts/components/notification-bell.tsx`, `src/shared/ui/dialog.tsx`

- `mobile-nav.tsx`: remover `backdrop-blur-xl`; container → `rounded-2xl border border-border bg-card shadow-elevated`; slot ativo → `bg-brand-subtle text-brand-emphasis`; slot inativo → `text-muted-foreground`.
- `mobile-drawer.tsx`: overlay → `bg-ink/60` sem `backdrop-blur-[3px]`; painel mantém `shadow-elevated`, borda `border-border`.
- `notification-bell.tsx`: popover → `ui-panel-elevated`; badge de não lidas mantém `bg-destructive`.
- `dialog.tsx`: overlay sem `backdrop-blur-sm` (usar `bg-ink/60`); content mantém `ui-panel-elevated`.

- **Aceite:** busca por `backdrop-blur` e `blur-` no `src/` retorna zero ocorrências.

#### Passo 2.5 — Ritmo do container

Arquivo: `src/layouts/components/app-shell.tsx`

- Linha 39: `px-4 py-6 pb-28 md:pb-10 lg:px-6 lg:py-8 xl:px-8` → `px-4 py-6 pb-28 sm:px-6 md:pb-10 lg:px-8 lg:py-8`.
- Linha 18: `transition-[width] duration-300 ease-in-out` → `transition-[width] duration-200` com `var(--ease-out-quart)` via classe utilitária ou `ease-out`; idem na linha 34 para `transition-[padding]`.
- `footer.tsx`: `border-border/40` → `border-border`; texto → `ui-microlabel` centralizado.

- **Aceite:** margens laterais do conteúdo idênticas às da landing em cada breakpoint.

---

### Fase 3 — Cabeçalho de página

#### Passo 3.1 — `PageHeader` com a hierarquia da landing

Arquivo: `src/shared/components/page-header.tsx` e a classe `.page-header-strip` em `globals.css:351`

O cabeçalho hoje é um card branco sobre o canvas, o que compete visualmente com os cards de conteúdo logo abaixo. A landing nunca encaixota títulos. Nova composição:

- Remover o card: `.page-header-strip` passa a ser um bloco sem borda/sombra/fundo, apenas `@apply min-w-0`. Manter a classe (é referenciada em outros lugares) mas neutra.
- Estrutura interna: `badge` (quando presente) renderizado como `ui-eyebrow` em vez de pill — o texto "Empresa" / "Pessoal" vira eyebrow uppercase laranja.
- Título: `text-[1.625rem] font-bold leading-[1.15] text-balance sm:text-[1.875rem]` (escala do `SectionHeader` alinhado à esquerda, `section-header.tsx:34`).
- Descrição: `mt-2 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground`.
- Separador: `border-b border-border pb-5` para ancorar o cabeçalho sem caixa.

Como `PageHeader` é usado em ~15 páginas, validar visualmente ao menos: `/dashboard`, `/vistorias`, `/financeiro`, `/usuarios`, `/auditoria`, `/configuracoes`.

- **Aceite:** cabeçalho sem caixa, com eyebrow laranja, título maior e linha divisória; nenhuma página com título quebrado ou botão desalinhado.

---

### Fase 4 — KPI cards (maior ganho visual)

#### Passo 4.1 — Reescrever `KpiCard`

Arquivo: `src/shared/components/charts/kpi-card.tsx`

Deletar por completo `ICON_THEMES` (linhas 4–29), o componente `KpiLabel` (linhas 42–52) e todas as camadas decorativas (linhas 69–91, 95–118). Reescrever:

```tsx
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface KpiCardProps {
  label?: string;
  title?: string;
  value: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  trend?: string;
  trendUp?: boolean;
  /** Card isolado (fora de StatsGrid) desenha a própria superfície */
  standalone?: boolean;
  className?: string;
}

export function KpiCard({
  label,
  title,
  value,
  icon: Icon,
  isLoading,
  trend,
  trendUp,
  standalone,
  className,
}: KpiCardProps) {
  const heading = title ?? label ?? "";

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between gap-5 bg-card p-5 sm:p-6",
        standalone && "ui-panel ui-panel-interactive",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="ui-microlabel pt-0.5">{heading}</p>
        {Icon && (
          <span className="ui-icon-box h-9 w-9">
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="h-8 w-28 rounded-md bg-muted" />
      ) : (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <p className="ui-metric text-[1.75rem] font-bold leading-none text-foreground sm:text-[2rem]">
            {value}
          </p>
          {trend && (
            <span className={trendUp ? "ui-chip-positive" : "ui-chip-negative"}>
              {trendUp ? (
                <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              )}
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
```

Mudanças de intenção: composição centralizada mantida (decisão do cliente), ícone como âncora no topo e não como enfeite, `tabular-nums` no valor para estabilizar a largura dos dígitos, `themeIndex` e todas as camadas decorativas eliminados.

Ordem vertical: ícone → rótulo (`ui-microlabel`) → valor → chip de variação. Altura mínima `min-h-[9.5rem]` para que os cartões da fileira empatem sem depender do conteúdo.

- **Aceite:** `themeIndex` não existe mais no arquivo; nenhuma classe `orange-*`/`amber-*`/`emerald-*`/`slate-*`; nenhum `blur`.

#### Passo 4.2 — `StatsGrid` como grid hairline

Arquivo: `src/shared/components/charts/stats-grid.tsx`

Trocar o grid de cards soltos por um painel único com divisórias de 1px:

```tsx
<div className={cn("ui-grid-hairline sm:grid-cols-2 xl:grid-cols-4", className)}>
  {items.map((item) => (
    <KpiCard key={item.title} {...item} />
  ))}
</div>
```

Remover a passagem de `themeIndex`. Consequência: os KPIs deixam de ter borda individual e viram um bloco coeso — mesmo efeito da `benefits-section` da landing.

#### Passo 4.3 — Auditar consumidores de `KpiCard` e `StatsGrid`

Buscar `KpiCard` e `StatsGrid` no `src/`. Consumidores conhecidos: `dashboard-page.tsx`, `financial-page.tsx`, `reports-summary.tsx`, `audit-page.tsx`, `consulta-credits-page.tsx`, `consulta-history-page.tsx`, `consulta-detail-page.tsx`, `cliente/consultas-page.tsx`, `cliente/profile-page.tsx`, `inspections-page.tsx`.

Para cada um: se usa `StatsGrid`, nada a fazer além de validar visualmente. Se instancia `KpiCard` direto fora de um `ui-grid-hairline`, passar `standalone`.

Ajustar também `dashboard-page.tsx:235` se o número de KPIs variar entre 3 e 4 — com 3 itens em `xl:grid-cols-4` sobra uma célula vazia com fundo de borda. Solução: em `StatsGrid`, derivar as colunas da quantidade (`items.length >= 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"`).

- **Aceite:** nenhuma célula vazia no grid de KPIs em nenhuma página, com 3 ou 4 itens; KPIs isolados com borda própria.

#### Passo 4.4 — Padronizar o `StatCard` do checklist

Arquivo: `src/modules/torres-vistoria/components/checklist/checklist-summary.tsx` (~linha 117)

O `StatCard` local usa `emerald-50`/`amber-50`/`slate-50` hardcoded. Migrar para os tokens: verde → `success`, âmbar → `warning`, neutro → `muted`, com `rounded-lg border border-border` e rótulo em `ui-microlabel`.

- **Aceite:** nenhuma cor Tailwind bruta no arquivo.

---

### Fase 5 — Cards de gráfico

#### Passo 5.1 — `ChartWrapper`

Arquivo: `src/shared/components/charts/chart-wrapper.tsx`

- Container: `surface-interactive overflow-hidden` → `ui-panel ui-panel-interactive overflow-hidden`.
- Header: substituir a `div` das linhas 21–33 por `ui-panel-header`; `border-border/50` já sai nessa troca.
- Título: `text-base font-bold tracking-tight` → `text-[17px] font-bold text-foreground` (escala de card da landing, `benefits-section.tsx:52`).
- Descrição: `mt-1 text-xs` → `mt-1 text-[13px] leading-relaxed text-muted-foreground`.
- Ícone: `h-10 w-10 rounded-xl bg-primary/10 text-primary` → `ui-icon-box h-10 w-10`.
- Corpo: `p-4 md:p-5` → `ui-panel-body`.

#### Passo 5.2 — Navegação de período

Arquivo: `src/shared/components/charts/monthly-chart-navigation.tsx`

- Container: `rounded-xl border border-border/60 bg-muted/30` → `rounded-lg border border-border bg-muted`.
- Rótulo "Período": `ui-microlabel`.
- Valor do range: `text-[13px] font-bold text-foreground tabular`.
- Botões: `h-8 w-8 rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-brand-subtle hover:text-primary disabled:opacity-40` — remover `shadow-sm`, `rounded-full`, `hover:border-primary/40`, `transition-all` e as cascatas `disabled:hover:*`.

#### Passo 5.3 — Gráficos de área e barra

Arquivos: `src/modules/torres-vistoria/components/dashboard/monthly-overview.tsx`, `src/modules/torres-vistoria/components/charts/revenue-chart.tsx`

- Consumir `CHART_COLORS`, `chartAxisStyle` e `chartTooltipStyle` atualizados; nenhum hex inline no componente.
- `CartesianGrid`: apenas linhas horizontais (`horizontal`), `stroke={CHART_COLORS.grid}`, `strokeDasharray="3 3"`, sem linha vertical.
- Barras: `radius={[8, 8, 0, 0]}`, `maxBarSize={44}` — barra menos "gorda", mais próxima do peso gráfico da landing.
- Área: gradiente vertical permitido (é SVG, não CSS filter), de `primary` a 18% até 0%; `strokeWidth={2}`.
- Remover qualquer `activeDot` com halo grande; usar `r={4}` com `stroke={CHART_COLORS.surface}` e `strokeWidth={2}`.

#### Passo 5.4 — Donut de marcas

Arquivo: `src/modules/torres-vistoria/components/charts/inspections-pie-chart.tsx`

- `stroke="#FFFFFF"` (linha 48) → `stroke={CHART_COLORS.surface}`; `strokeWidth={3}` → `2`.
- `paddingAngle={4}` → `2`, `innerRadius="58%"` → `"62%"` — anel mais fino e elegante.
- Centro (linhas 65–72): número em `ui-metric text-[2rem] font-bold`; rótulo "total" em `ui-microlabel`.
- Legenda (linhas 75–94): trocar a lista de itens com borda individual por `ui-grid-hairline sm:grid-cols-2` com filhos `bg-card px-3 py-2.5`; percentual em `ui-metric text-sm font-bold text-foreground` (não `text-primary` — o ponto colorido já identifica a série) e contagem em `text-xs text-muted-foreground`.
- Estado vazio: `flex min-h-[220px] items-center justify-center text-sm text-muted-foreground`.

- **Aceite:** os três cards de gráfico com header, borda e padding idênticos; nenhum hex em JSX.

---

### Fase 6 — Lista de últimas vistorias

#### Passo 6.1 — `RecentInspections`

Arquivo: `src/modules/torres-vistoria/components/dashboard/recent-inspections.tsx`

- Container (linha 14): `surface-interactive overflow-hidden` → `ui-panel ui-panel-interactive flex h-full flex-col overflow-hidden` (o `h-full` faz o card empatar a altura com o donut na coluna vizinha).
- Header (linhas 15–31): usar `ui-panel-header`; caixa do ícone → `ui-icon-box h-10 w-10`; título `text-[17px] font-bold`; descrição `text-[13px] text-muted-foreground`.
- Divisórias: `divide-y divide-border/50` → `divide-y divide-border`.
- Item (linha 47): `hover:bg-primary/[0.03]` → `hover:bg-brand-subtle`; padding `px-5 py-4 md:px-6`.
- Número da vistoria (linha 50): `h-11 w-11 rounded-xl bg-muted/80 text-xs font-bold text-primary` → `ui-icon-box h-11 w-11 text-[13px] font-bold tabular`.
- Placa: aplicar `font-mono uppercase tracking-[0.08em]` — a landing formata placa/chassi assim (`hero-consulta-form`, `sample-report-document`).
- Skeleton (linha 36): `h-20 animate-pulse bg-muted/30` → `h-[76px] bg-muted` sem `animate-pulse` (pulso infinito é proibido); ou usar opacidade estática.
- Estado vazio: usar o `EmptyState` compartilhado em vez do parágrafo solto, se a API dele permitir sem props obrigatórias.

#### Passo 6.2 — Limpar o alias temporário

Arquivo: `src/styles/globals.css`

Remover `.surface-interactive` da lista de seletores de `.ui-panel` (o alias temporário do Passo 1.2) e verificar que todo consumidor de `.surface-interactive` agora também aplica `.ui-panel`. Buscar `surface-interactive` no `src/` e corrigir os restantes.

- **Aceite:** nenhum card sem borda/fundo após a remoção do alias.

---

### Fase 7 — Composição da página de dashboard

#### Passo 7.1 — Ritmo vertical e grid

Arquivo: `src/modules/torres-vistoria/pages/dashboard-page.tsx`

- Wrapper (linha 218): `space-y-6` → `space-y-6 lg:space-y-8` — a landing respira mais entre blocos.
- Grid de gráficos (linha 123): `gap-4 xl:grid-cols-12 xl:gap-5` → `gap-4 lg:gap-5 xl:grid-cols-12`. Manter a divisão 6/6 e 5/7.
- `ChartFallback` (linhas 43–49): altura `h-64` → `h-[260px]` para casar com `.chart-responsive` e evitar salto de layout ao carregar o gráfico.
- Botão "Nova vistoria" (linha 224): manter `size="lg"`; remover `touch-target` (o `min-height: 44px` global de `globals.css:91` já garante).

#### Passo 7.2 — Banner de escopo

Arquivo: `src/modules/torres-vistoria/components/dashboard/dashboard-scope-banner.tsx`

Ler o arquivo e alinhar ao padrão: `ui-panel` com `border-border`, ícone em `ui-icon-box`, texto `text-[15px]`, sem cor Tailwind bruta.

- **Aceite:** `/dashboard` com espaçamento uniforme, sem salto ao carregar gráficos.

---

### Fase 8 — Varredura de consistência

#### Passo 8.1 — Eliminar opacidades arbitrárias

Buscar no `src/` (excluindo `modules/torres-consulta`) os padrões `border-border/`, `bg-muted/`, `divide-border/`, `bg-primary/`, `ring-primary/`, `text-muted-foreground/`.

Regra de substituição:

| De | Para |
|---|---|
| `border-border/40`, `/50`, `/60`, `/70` | `border-border` |
| `divide-border/50` | `divide-border` |
| `bg-muted/20`, `/30`, `/60`, `/80` | `bg-muted` |
| `bg-primary/[0.03]`, `bg-primary/5` (hover) | `hover:bg-brand-subtle` |
| `bg-primary/10`, `/12`, `/15` (superfície de destaque) | `bg-brand-subtle` ou `ui-icon-box` |
| `text-primary` sobre `bg-brand-subtle` | `text-brand-emphasis` |
| `ring-1 ring-primary/*` | remover |

#### Passo 8.2 — Normalizar raios

Buscar `rounded-[`, `rounded-2xl` e `rounded-3xl` no `src/` fora da landing. Aplicar a escala: elementos internos e controles → `rounded-lg`; cards e painéis → `rounded-xl`; barras flutuantes e drawers → `rounded-2xl`; pills → `rounded-full`.

#### Passo 8.3 — Normalizar sombras

Buscar `shadow-[`, `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl` no `src/` fora da landing. Mapear: `shadow-sm` → `shadow-soft`; `shadow-md`/`shadow-lg` → `shadow-card`; `shadow-xl`/arbitrária → `shadow-elevated`.

#### Passo 8.4 — Normalizar transições

Trocar `transition-all` por `transition-colors` (ou `transition-[border-color,box-shadow]` quando houver elevação). Duração padrão: `duration-150` para cor, `duration-200` para transform. Remover `animate-pulse` de skeletons persistentes.

- **Aceite:** as buscas dos passos 8.1–8.4 retornam apenas ocorrências dentro de `modules/torres-consulta` (landing) ou justificadas por comentário.

#### Executado — desvios e acréscimos

A varredura exigiu três tokens novos, porque as cores semânticas só existiam em cheio (`--color-success`, `--color-warning`, `--color-destructive`) e todo estado tonal era montado com opacidade arbitrária:

```css
--color-brand-border: #f7cdae;
--color-success-subtle / --color-success-border
--color-warning-subtle / --color-warning-border
--color-destructive-subtle / --color-destructive-border
```

Com eles, `bg-emerald-50 text-emerald-800 border-emerald-200/80` virou `bg-success-subtle text-success border-success-border`, e `.ui-chip-positive` / `.ui-chip-negative` deixaram de calcular `rgb(... / 0.1)` inline. Foi adicionado `.ui-chip-warning` para fechar o trio.

Mapas de cor de domínio tokenizados (maior alavancagem, um arquivo governa dezenas de telas):

- `domain/checklist/checklist-status.ts` — as 4 famílias (emerald/amber/slate/orange) passaram a success/warning/muted/brand. `pdfColor` também foi alinhado à paleta da marca.
- `admin/audit/utils/audit-presentation.ts` — sete cores decorativas reduzidas a cinco grupos semânticos (criação, alteração, exclusão, autenticação, exportação). O rótulo já distingue a ação; a cor passou a codificar a natureza dela.
- `core/tenant/company-display.ts` — badges de plano trial/active.

Foco visível: os inputs empilhavam `focus-visible:ring-2 ring-primary/20` sobre o `outline` global de `:focus-visible`, dobrando o indicador. Ficou só `focus-visible:border-primary` + outline global.

`.gradient-primary` foi removido do `globals.css` — era `background-color: var(--color-primary)` disfarçado de gradiente, e ficou órfão após a varredura.

Fora de escopo por decisão: `components/pdf/laudo-template.tsx` (linguagem visual do documento impresso, não da interface) e `core/auth/components/tenant-auth-showcase.tsx` (superfície escura invertida, sem tokens correspondentes na paleta clara).

#### Duas regressões que a Fase 8 introduziu na landing, e a correção

A Fase 1 tinha isolado a landing por aliasing. A Fase 8 furou esse isolamento em dois pontos, porque `shared/ui` e `shared/components` são consumidos por `modules/torres-consulta` — inclusive pelo hero da landing:

1. `--color-brand-border` (#f7cdae) foi aplicado ao bloco compartilhado `.ui-icon-box, .landing-icon-box`, trocando a borda da landing de #f9d7bf para #f7cdae em 9 pontos de `landing-ui.tsx` e em `consumer-surface.tsx`. **Correção:** `.landing-icon-box` recebeu uma sobrescrita explícita com #f9d7bf. O token continua governando o painel.
2. `shared/ui/input.tsx` teve o placeholder trocado de `text-muted-foreground` (#5c6672, 5,8:1 sobre branco) para `text-subtle-foreground` (#8a939e, 3,1:1) — abaixo do mínimo de 4,5:1 do WCAG AA, e o `Input` é o campo do `hero-consulta-form`, acima da dobra da landing. **Correção:** revertido para `text-muted-foreground` no `Input` e no `textareaInputClass`.

Mudança compartilhada mantida de propósito: a remoção do `focus-visible:ring-2 ring-primary/20` do `Input`. O `:focus-visible` global (`globals.css:103`) desenha `outline: 2px solid var(--color-primary)` com offset — indicador mais forte que o anel a 20% de opacidade, não mais fraco. O anel duplicado era o defeito.

Lição para a Fase 9: `shared/ui/**` e `shared/components/**` **não** são território exclusivo do painel. Antes de editar qualquer um deles, verificar os consumidores em `modules/torres-consulta`.

Efeito colateral mensurável: o CSS do bundle caiu de 133,19 kB para 115,33 kB (−13%), reflexo das utilitárias one-off que deixaram de ser geradas.

---

### Fase 9 — Propagação e verificação

#### Passo 9.1 — Aplicar o padrão nas demais páginas do painel

Na ordem de tráfego, aplicando as mesmas regras das Fases 3–8:

1. `src/modules/torres-vistoria/pages/inspections-page.tsx` (+ filtros, tabela, `data-table.tsx`)
2. `src/modules/torres-vistoria/pages/financial-page.tsx` (+ `financial-revenue-page`, `financial-expenses-page`)
3. `src/modules/torres-vistoria/pages/reports-page.tsx` (+ `reports-summary.tsx`)
4. `src/modules/admin/users/pages/users-page.tsx` (+ `user-card.tsx`, diálogos)
5. `src/modules/admin/audit/pages/audit-page.tsx` (+ filtros, badges)
6. `src/modules/admin/settings/pages/*` (+ `settings-section.tsx`)
7. `src/modules/torres-vistoria/pages/inspection-detail-page.tsx` e o wizard (`inspection-wizard-shell.tsx`)

Cada página é um commit próprio.

#### Passo 9.2 — Verificação final

```powershell
npx tsc --noEmit
npm run lint
npm run build
```

Checklist visual em 375px, 768px, 1280px e 1920px, para `/dashboard` e cada página da lista 9.1:

- [ ] Nenhum blur em nenhuma superfície
- [ ] KPIs formam um bloco coeso, números alinhados em coluna
- [ ] Todos os cards com a mesma borda, raio e sombra
- [ ] Sidebar ativa em `brand-subtle`, sem halo
- [ ] Header opaco de 64px, sem salto no mobile
- [ ] Gráficos na paleta laranja/ink da marca
- [ ] Cabeçalhos de página com eyebrow + título + divisória
- [ ] Nenhum scroll horizontal em 375px
- [ ] `prefers-reduced-motion` respeitado
- [ ] Foco visível em todos os controles interativos

---

## 4. Decisões de design registradas

| Decisão | Motivo |
|---|---|
| KPI sem tema de cor por índice | Cor deve codificar significado (positivo/negativo), não posição no array. Quatro cores decorativas competem com o laranja da marca. |
| KPI em grid hairline em vez de cards soltos | Reduz de 4 bordas + 4 sombras para 1 painel; é o padrão que a landing usa em `benefits-section`. |
| KPI com conteúdo centralizado | Preferência do cliente. `tabular-nums` e `min-h` fixa preservam o alinhamento vertical entre cartões. |
| Tokens `*-subtle` / `*-border` para success, warning e destructive | Estados tonais eram montados com opacidade arbitrária sobre a cor cheia; sem token, cada tela inventava a sua. |
| Cor de badge de auditoria por grupo semântico, não por ação | Sete cores para sete ações viram decoração. O rótulo já identifica a ação; a cor deve dizer se é criação, alteração, exclusão, autenticação ou exportação. |
| Um único indicador de foco | `ring` do componente + `outline` global de `:focus-visible` desenhavam dois anéis concêntricos. |
| `.landing-icon-box` sobrescreve o token de borda | A landing é a referência aprovada. Onde o token divergir do valor original dela, a landing ganha e o token serve ao painel. |
| `tabular-nums` obrigatório em métricas | Sem isso os dígitos mudam de largura e a comparação vertical entre KPIs falha. |
| Cabeçalho de página sem caixa | A landing nunca encaixota títulos; o card de header competia com os cards de dados. |
| Zero blur | Regra já declarada em `globals.css:4-8`, hoje violada em 5 arquivos. Blur em barra fixa mobile é custo de composição por frame. |
| `brand-subtle` em vez de `primary/10` | Token semântico é rastreável e ajustável; opacidade arbitrária não. |
| Manter Recharts | Substituir biblioteca é mudança de escopo; o problema era paleta, não a lib. |
| Sem scroll-reveal no painel | Dado precisa aparecer imediatamente. Animação de entrada é linguagem de marketing, não de ferramenta. |

---

## 5. Ordem de execução resumida

| Fase | Escopo | Risco | Depende de |
|---|---|---|---|
| 1 | Tokens, CSS unificado, paleta de gráficos, config | Médio (toca landing indiretamente) | — |
| 2 | Shell: sidebar, header, mobile | Baixo | 1 |
| 3 | `PageHeader` | Médio (~15 páginas) | 1 |
| 4 | KPI cards | Baixo | 1 |
| 5 | Cards de gráfico | Baixo | 1 |
| 6 | Lista de vistorias + limpeza do alias | Baixo | 1, 5 |
| 7 | Composição do dashboard | Baixo | 4, 5, 6 |
| 8 | Varredura de consistência | Baixo | 2–7 |
| 9 | Demais páginas + verificação | Baixo | 8 |

A Fase 1 é bloqueante para todas as outras. As Fases 4, 5 e 6 são independentes entre si e podem ser feitas em qualquer ordem depois da 1.
