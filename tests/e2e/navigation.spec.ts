import { test, expect } from "@playwright/test";
import { e2eCredentialsConfigured, loginAsDemo } from "./helpers";

test.describe("Navegação autenticada", () => {
  test.skip(!e2eCredentialsConfigured(), "Defina E2E_*_EMAIL/PASSWORD no ambiente");

  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page, "vistoriador");
  });

  test("lista vistorias", async ({ page }) => {
    await page.getByRole("link", { name: /^Vistorias$/i }).first().click();
    await expect(page).toHaveURL("/vistorias");
    await expect(page.getByRole("heading", { name: "Vistorias", exact: true })).toBeVisible();
  });

  test("filtra vistorias por placa", async ({ page }) => {
    await page.goto("/vistorias");
    const filter = page.getByLabel("Filtrar por placa");
    await expect(filter).toBeVisible();
    await filter.fill("ZZZ9Z99");
    // Conta sem dados demo: o filtro não deve quebrar a página.
    await expect(page.getByRole("heading", { name: "Vistorias", exact: true })).toBeVisible();
  });

  test("acessa relatórios", async ({ page }) => {
    await page.getByRole("link", { name: /Relatórios/i }).first().click();
    await expect(page).toHaveURL("/relatorios");
    await expect(page.getByRole("heading", { name: "Relatórios" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Exportar" })).toBeVisible();
  });
});
