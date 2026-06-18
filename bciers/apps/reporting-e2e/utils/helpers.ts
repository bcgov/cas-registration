import { Locator, Page, expect } from "@playwright/test";
import { ReportRoutes } from "./enums";
import { ACTION_BUTTON_TEXT, REPORTING_REPORTS_BASE_PATH } from "./constants";
import { clickButton } from "@bciers/e2e/utils/helpers";

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

export async function verifyReportHeader(
  page: Page,
  operationName: string,
  versionText: string,
): Promise<void> {
  await expect(page.locator("main h2")).toHaveText(operationName);
  await expect(page.locator("main small")).toHaveText(versionText);
}

export async function verifySaveAsPDF(page: Page): Promise<void> {
  const saveAsPDFButton = page.getByRole("button", {
    name: /Save as PDF/i,
  });
  await expect(saveAsPDFButton).toBeVisible();
  await expect(saveAsPDFButton).toBeEnabled();

  // This is how Playwright recommends testing print dialogs: https://playwright.dev/docs/dialogs#print-dialogs
  // which is what the "Save as PDF" button triggers.
  await page.evaluate(
    "(() => {window.waitForPrintDialog = new Promise(f => window.print = f);})()",
  );
  await saveAsPDFButton.click();
  await page.waitForFunction("window.waitForPrintDialog");
}

export async function clickViewReportDetails(
  page: Page,
  row: Locator,
  isExternalUser: boolean = true,
): Promise<void> {
  const viewReportRoute = isExternalUser
    ? ReportRoutes.SUBMITTED_REPORT
    : ReportRoutes.ANNUAL_REPORT;

  const routeRegex = new RegExp(
    String.raw`${REPORTING_REPORTS_BASE_PATH}/\d+/${viewReportRoute}`,
    "i",
  );
  const buttonName = new RegExp(
    isExternalUser
      ? ACTION_BUTTON_TEXT.VIEW_DETAILS + "$"
      : ACTION_BUTTON_TEXT.VIEW_REPORT + "$",
    "i",
  );

  await clickButton(page, buttonName, {
    root: row,
    waitForUrl: routeRegex,
  });
}
