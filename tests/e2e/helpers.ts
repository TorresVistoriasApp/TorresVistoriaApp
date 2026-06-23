import { expect, type Page } from "@playwright/test";

const DEMO = {
  superAdmin: {
    email: "admin@torresvistorias.com.br",
    password: "TorresDemo2026!",
    buttonName: /Super Admin/i,
  },
  vistoriador: {
    email: "vistoriador@torresvistorias.com.br",
    password: "TorresDemo2026!",
    buttonName: "Vistoriador",
  },
} as const;

export async function loginAsDemo(
  page: Page,
  role: keyof typeof DEMO = "vistoriador",
): Promise<void> {
  await page.goto("/login");
  await expect(page.getByTestId("login-form")).toBeVisible();
  await page.getByRole("button", { name: DEMO[role].buttonName }).click();
  await expect(page).toHaveURL("/", { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  const profileName = role === "superAdmin" ? "Torres Vistorias Admin" : "Vistoriador Demo";
  await expect(page.getByText(profileName)).toBeVisible({ timeout: 15_000 });
}

export async function expectDashboard(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}
