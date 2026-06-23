import { test, expect } from "@playwright/test";

test.describe("Autenticação", () => {
  test("exibe formulário de login", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByLabel("E-mail")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
  });

  test("login demo vistoriador redireciona ao dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Vistoriador" }).click();
    await expect(page).toHaveURL("/", { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("login demo super admin acessa financeiro", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Super Admin/i }).click();
    await expect(page).toHaveURL("/", { timeout: 15_000 });

    await page.goto("/financeiro");
    await expect(page.getByRole("heading", { name: "Financeiro" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("vistoriador não acessa financeiro (acesso negado)", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Vistoriador" }).click();
    await expect(page).toHaveURL("/", { timeout: 15_000 });

    await page.goto("/financeiro");
    await expect(page.getByText("Acesso negado")).toBeVisible();
  });
});
