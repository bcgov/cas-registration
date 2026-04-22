import { Page, expect } from "@playwright/test";

export async function verifyFormTitle(
  page: Page,
  title: string,
): Promise<void> {
  await expect(page.locator("form").getByText(title)).toBeVisible();
}

export async function verifyFieldTemplateLabel(
  page: Page,
  text: string,
): Promise<void> {
  await expect(page.getByTestId("field-template-label")).toContainText(text);
}
