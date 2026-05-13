import { Page, expect } from "@playwright/test";

export async function verifyFormTitle(
  page: Page,
  title: string,
): Promise<void> {
  await expect(
    page.locator(
      '[data-testid="field-template-label"][for="root"], .form-heading',
    ),
  ).toHaveText(title);
}

export async function verifySaveAsPDF(page: Page): Promise<void> {
  const saveAsPDFButton = page.getByRole("button", {
    name: /Save as PDF/i,
  });
  await expect(saveAsPDFButton).toBeVisible();
  await expect(saveAsPDFButton).toBeEnabled();

  await page.evaluate(
    "(() => {window.waitForPrintDialog = new Promise(f => window.print = f);})()",
  );
  await saveAsPDFButton.click();
  await page.waitForFunction("window.waitForPrintDialog");
}
