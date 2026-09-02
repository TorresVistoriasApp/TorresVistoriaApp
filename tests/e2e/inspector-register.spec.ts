import { expect, test } from "@playwright/test";

test.describe("Cadastro de vistoriador (Fase A)", () => {
  test("formulário não coloca CPF/CNPJ na URL", async ({ page }) => {
    await page.goto("/vistoria/cadastro");
    await expect(page.locator("#conteudo").getByTestId("register-form")).toBeVisible();

    await page.locator("#conteudo").getByRole("textbox", { name: "Documento" }).fill("529.982.247-25");

    await expect(page).toHaveURL(/\/vistoria\/cadastro\/?$/);
    expect(page.url()).not.toMatch(/52998224725|529\.982\.247-25|document=/i);

    const storage = await page.evaluate(() => {
      const dump = (store: Storage) => {
        const entries: Record<string, string> = {};
        for (let i = 0; i < store.length; i += 1) {
          const key = store.key(i);
          if (key) entries[key] = store.getItem(key) ?? "";
        }
        return entries;
      };
      return { local: dump(localStorage), session: dump(sessionStorage) };
    });
    const serialized = JSON.stringify(storage);
    expect(serialized).not.toMatch(/52998224725|529\.982\.247-25/);
  });
});
