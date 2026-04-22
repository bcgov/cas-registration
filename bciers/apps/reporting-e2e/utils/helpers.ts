import { Page, expect } from "@playwright/test";

export async function verifyFormTitle(
  page: Page,
  title: string,
): Promise<void> {
  await expect(
    page.locator('[data-testid="field-template-label"][for="root"]'),
  ).toHaveText(title);
}
