import { test, expect } from "@playwright/test";
import { e2eCredentialsConfigured, loginAsDemo } from "./helpers";

test.describe("Autenticação", () => {
  test("exibe formulário de login", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByLabel("E-mail")).toBeVisible();
    await expect(page.getByLabel("Senha", { exact: true })).toBeVisible();
  });

  test.describe("fluxos autenticados", () => {
    test.skip(!e2eCredentialsConfigured(), "Defina E2E_*_EMAIL/PASSWORD no ambiente");

    test("login vistoriador redireciona ao dashboard", async ({ page }) => {
      await loginAsDemo(page, "vistoriador");
    });

    test("login super admin acessa financeiro", async ({ page }) => {
      await loginAsDemo(page, "superAdmin");
      await page.goto("/financeiro");
      await expect(page.getByRole("heading", { name: "Financeiro" })).toBeVisible({
        timeout: 10_000,
      });
    });

    test("vistoriador não acessa despesas da empresa (acesso negado)", async ({ page }) => {
      await loginAsDemo(page, "vistoriador");
      await page.goto("/financeiro/despesas");
      await expect(page.getByText("Acesso negado")).toBeVisible();
    });
  });
});
