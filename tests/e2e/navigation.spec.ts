import { test, expect } from "@playwright/test";
import { loginAsDemo } from "./helpers";

test.describe("Navegação autenticada", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page, "vistoriador");
  });

  test("lista vistorias demo", async ({ page }) => {
    await page.getByRole("link", { name: /Vistorias/i }).first().click();
    await expect(page).toHaveURL("/vistorias");
    await expect(page.getByRole("heading", { name: "Vistorias" })).toBeVisible();
    await expect(page.getByText("ABC1D23")).toBeVisible({ timeout: 10_000 });
  });

  test("filtra vistorias por placa", async ({ page }) => {
    await page.goto("/vistorias");
    await page.getByLabel("Filtrar por placa").fill("XYZ9A87");
    await expect(page.getByText("XYZ9A87")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("ABC1D23")).not.toBeVisible();
  });

  test("acessa relatórios", async ({ page }) => {
    await page.getByRole("link", { name: /Relatórios/i }).first().click();
    await expect(page).toHaveURL("/relatorios");
    await expect(page.getByRole("heading", { name: "Relatórios" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Exportar CSV" })).toBeEnabled();
  });
});
