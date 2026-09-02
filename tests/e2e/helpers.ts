import { expect, type Page } from "@playwright/test";

type DemoRole = "superAdmin" | "vistoriador";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Defina ${name} no ambiente (ou em .env.local) para rodar E2E autenticado. Não versionamos senhas.`,
    );
  }
  return value;
}

function credentialsFor(role: DemoRole) {
  if (role === "superAdmin") {
    return {
      email: requireEnv("E2E_ADMIN_EMAIL"),
      password: requireEnv("E2E_ADMIN_PASSWORD"),
      profileName: process.env.E2E_ADMIN_NAME?.trim() || "Torres Vistorias Admin",
    };
  }
  return {
    email: requireEnv("E2E_INSPECTOR_EMAIL"),
    password: requireEnv("E2E_INSPECTOR_PASSWORD"),
    profileName: process.env.E2E_INSPECTOR_NAME?.trim() || "Vistoriador Demo",
  };
}

/** Login via formulário. Credenciais vêm só de variáveis de ambiente. */
export async function loginAsDemo(page: Page, role: DemoRole = "vistoriador"): Promise<void> {
  const { email, password, profileName } = credentialsFor(role);

  await page.goto("/login");
  const login = page.locator("#conteudo");
  await expect(login.getByTestId("login-form")).toBeVisible();
  await login.getByLabel("E-mail").fill(email);
  await login.getByLabel("Senha", { exact: true }).fill(password);
  await login.getByRole("checkbox").check();
  await login.getByRole("button", { name: /entrar/i }).click();
  await expect(page).toHaveURL("/dashboard", { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  const cookieAccept = page.getByRole("button", { name: /Aceitar essenciais/i });
  if (await cookieAccept.isVisible().catch(() => false)) {
    await cookieAccept.click();
  }

  await expect(page.getByText(profileName).first()).toBeVisible({ timeout: 15_000 });
}

export async function expectDashboard(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

export function e2eCredentialsConfigured(): boolean {
  return Boolean(
    process.env.E2E_ADMIN_EMAIL &&
      process.env.E2E_ADMIN_PASSWORD &&
      process.env.E2E_INSPECTOR_EMAIL &&
      process.env.E2E_INSPECTOR_PASSWORD,
  );
}
