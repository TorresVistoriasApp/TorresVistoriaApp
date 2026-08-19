/**
 * Contrato de autorização — inspection_orders × INSPECTOR (Correção C.1)
 *
 * Verifica estaticamente que as migrations garantem:
 *   1. INSPECTOR só cria order para sua própria inspection
 *   2. SUPER_ADMIN cria order para qualquer inspection do tenant
 *   3. Cross-tenant é bloqueado
 *   4. Usuário não autenticado é bloqueado
 *   5. Manipulação de tenant_id e created_by é bloqueada
 *
 * Complemento: testes pgTAP em supabase/tests/ devem cobrir o runtime.
 * Estes testes validam a estrutura e a lógica declaradas nas migrations.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "supabase/migrations");

function readMigration(fileName: string): string {
  return readFileSync(path.join(MIGRATIONS_DIR, fileName), "utf8");
}

function allMigrations(): string {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(path.join(MIGRATIONS_DIR, f), "utf8"))
    .join("\n");
}

const FIX_MIGRATION = "20260819130000_fix_inspection_order_owner_check.sql";
const ORDERS_MIGRATION = "20260819120000_inspection_orders.sql";

// ─── Bloco principal ──────────────────────────────────────────────────────────

describe("inspection_order authorization contract (Correção C.1)", () => {
  const fixSql = readMigration(FIX_MIGRATION);
  const ordersSql = readMigration(ORDERS_MIGRATION);
  const allSql = allMigrations();

  // ── TESTE 1: INSPECTOR cria order para sua própria inspection ──────────────
  it("TESTE 1 — permite INSPECTOR criar order para inspection própria via can_access_inspection_row", () => {
    // A correção usa can_access_inspection_row, que internamente verifica
    // created_by = auth.uid() para INSPECTOR (acesso à própria inspection).
    expect(fixSql).toContain("can_access_inspection_row(NEW.inspection_id)");
    // A função deve estar presente em todas as migrations
    expect(allSql).toContain("can_access_inspection_row");
  });

  // ── TESTE 2: INSPECTOR bloqueado de criar order para inspection de outro inspector ──
  it("TESTE 2 — bloqueia INSPECTOR de criar order para inspection de outro inspector no mesmo tenant", () => {
    // O trigger rejeita quando can_access_inspection_row retorna false
    expect(fixSql).toContain("IF NOT public.can_access_inspection_row(NEW.inspection_id)");
    expect(fixSql).toContain("Vistoria não encontrada ou acesso negado.");

    // can_access_inspection_row usa can_access_tenant_row que exige:
    // INSPECTOR → created_by = auth.uid()
    expect(allSql).toContain("p_created_by = auth.uid()");
    expect(allSql).toContain("public.is_inspector()");
  });

  // ── TESTE 3: Cross-tenant bloqueado ──────────────────────────────────────
  it("TESTE 3 — bloqueia criação de order para inspection de outro tenant", () => {
    // Dupla proteção:
    // (a) RLS INSERT: tenant_id = get_user_tenant_id()
    expect(ordersSql).toContain("tenant_id = public.get_user_tenant_id()");

    // (b) Trigger step 2: inspection.tenant_id = order.tenant_id
    expect(fixSql).toContain("AND tenant_id = NEW.tenant_id");

    // (c) Trigger step 3: can_access_inspection_row também valida tenant
    //     (can_access_tenant_row: p_company_id = get_user_tenant_id())
    expect(allSql).toContain("p_company_id = public.get_user_tenant_id()");
  });

  // ── TESTE 4: SUPER_ADMIN cria order para inspection do próprio tenant ─────
  it("TESTE 4 — permite SUPER_ADMIN criar order para qualquer inspection do tenant", () => {
    // can_access_inspection_row → can_access_tenant_row → is_super_admin() bypassa created_by check
    expect(allSql).toContain("public.is_super_admin()");

    // Policy INSERT de inspection_orders permite is_super_admin()
    expect(ordersSql).toContain("public.is_super_admin()");
    expect(ordersSql).toContain("public.is_inspector()");
  });

  // ── TESTE 5: SUPER_ADMIN bloqueado de inspection de outro tenant ──────────
  it("TESTE 5 — bloqueia SUPER_ADMIN de criar order para inspection de outro tenant", () => {
    // RLS INSERT: tenant_id = get_user_tenant_id() → a linha com tenant errado é rejeitada
    expect(ordersSql).toContain("tenant_id = public.get_user_tenant_id()");
    // Trigger step 2: verifica inspection.tenant_id = NEW.tenant_id explicitamente
    expect(fixSql).toContain("AND tenant_id = NEW.tenant_id");
    // O SUPER_ADMIN não consegue declarar um tenant_id diferente do seu — RLS bloqueia
    expect(ordersSql).toContain("WITH CHECK");
  });

  // ── TESTE 6: Não autenticado bloqueado ───────────────────────────────────
  it("TESTE 6 — bloqueia usuário não autenticado de criar inspection_order", () => {
    // RLS habilitado na tabela
    expect(ordersSql).toContain("ALTER TABLE public.inspection_orders ENABLE ROW LEVEL SECURITY");

    // A policy de INSERT é apenas para `authenticated` (TO authenticated)
    expect(ordersSql).toContain("TO authenticated");

    // Sem policy para `anon`: sem acesso (silêncio = negado quando RLS ativo)
    expect(ordersSql).not.toContain("TO anon");
  });

  // ── TESTE 7: Manipulação de tenant_id bloqueada ───────────────────────────
  it("TESTE 7 — bloqueia manipulação de tenant_id pelo frontend", () => {
    // Escrita via RLS: WITH CHECK(tenant_id = get_user_tenant_id())
    expect(ordersSql).toContain("tenant_id = public.get_user_tenant_id()");

    // UPDATE imutável via trigger
    expect(fixSql).toContain("NEW.tenant_id IS DISTINCT FROM OLD.tenant_id");
    expect(fixSql).toContain("O tenant do pedido não pode ser alterado.");
  });

  // ── TESTE 8: Manipulação de created_by bloqueada ─────────────────────────
  it("TESTE 8 — bloqueia manipulação de created_by pelo frontend", () => {
    // INSERT: policy exige created_by = auth.uid()
    expect(ordersSql).toContain("created_by = auth.uid()");

    // UPDATE: trigger bloqueia alteração (adicionado na Correção C.1)
    expect(fixSql).toContain("NEW.created_by IS DISTINCT FROM OLD.created_by");
    expect(fixSql).toContain("O criador do pedido não pode ser alterado.");
  });

  // ── Estrutura da correção ─────────────────────────────────────────────────
  it("a correção C.1 recria o trigger com a verificação de proprietário", () => {
    expect(fixSql).toContain("CREATE OR REPLACE FUNCTION public.enforce_inspection_order_integrity()");
    expect(fixSql).toContain("SECURITY DEFINER");
    expect(fixSql).toContain("SET search_path = public");
    expect(fixSql).toContain("REVOKE ALL ON FUNCTION public.enforce_inspection_order_integrity()");
    expect(fixSql).toContain("CREATE TRIGGER trg_enforce_inspection_order_integrity");
  });

  it("service role pode inserir sem restrição de auth.uid() (operações administrativas)", () => {
    // O guard só é aplicado quando auth.uid() IS NOT NULL
    expect(fixSql).toContain("IF auth.uid() IS NOT NULL THEN");
    // auth.uid() IS NULL = service role → não entra no bloco de verificação
  });

  it("o snapshot de preço é preservado — amount é sempre sobrescrito pelo banco", () => {
    expect(fixSql).toContain("NEW.amount   := v_service.base_price;");
    expect(fixSql).toContain("NEW.currency := v_service.currency;");
  });

  it("amount é imutável após criação mesmo com a nova correção", () => {
    expect(fixSql).toContain("NEW.amount IS DISTINCT FROM OLD.amount");
    expect(fixSql).toContain("O valor do pedido não pode ser alterado.");
  });

  it("platform_service_id é imutável após criação", () => {
    expect(fixSql).toContain("NEW.platform_service_id IS DISTINCT FROM OLD.platform_service_id");
    expect(fixSql).toContain("O serviço contratado não pode ser alterado após a criação.");
  });

  it("inspection_id é imutável após criação", () => {
    expect(fixSql).toContain("NEW.inspection_id IS DISTINCT FROM OLD.inspection_id");
    expect(fixSql).toContain("A vistoria vinculada ao pedido não pode ser alterada.");
  });

  it("mensagens de erro não revelam existência de inspection de outro usuário", () => {
    // Ambas as rejeições (tenant errado e owner errado) usam a mesma mensagem genérica
    const errorMsg = "Vistoria não encontrada ou acesso negado.";
    const occurrences = (fixSql.match(new RegExp(errorMsg, "g")) ?? []).length;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });
});
