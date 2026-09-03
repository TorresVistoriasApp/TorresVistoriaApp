import { expect, type Page } from "@playwright/test";
import { generateTotp } from "./totp";

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

  const enrollGate = page.getByRole("heading", { name: /Ative a verificação em duas etapas/i });
  const challengeGate = page.getByRole("heading", { name: /Confirme o acesso/i });
  if (role === "superAdmin") {
    await expect(
      page.getByRole("heading", { name: "Dashboard" }).or(enrollGate).or(challengeGate),
    ).toBeVisible({ timeout: 15_000 });

    if (await enrollGate.isVisible().catch(() => false)) {
      throw new Error(
        "Conta E2E_ADMIN ainda não tem TOTP. Enrole o autenticador nessa conta antes do E2E.",
      );
    }

    if (await challengeGate.isVisible().catch(() => false)) {
      const secret = process.env.E2E_ADMIN_TOTP_SECRET?.replace(/\s+/g, "");
      if (!secret) {
        throw new Error("Defina E2E_ADMIN_TOTP_SECRET para completar o MFA do admin no E2E.");
      }
      await page.locator("#mfa-challenge-code").fill(generateTotp(secret));
      await page.getByRole("button", { name: /Confirmar código/i }).click();
      await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
        timeout: 15_000,
      });
    }
  } else {
    await expect(page).toHaveURL("/dashboard", { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  }

  await expect(page).toHaveURL("/dashboard", { timeout: 5_000 });

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
