import { Page, expect } from "@playwright/test";

const REPORT_VALIDATION = {
  NO_ISSUES_TEXT:
    "No issues were detected by the automated validation. However, you may be contacted by Ministry staff in case additional questions are identified during report review.",
} as const;

export class ReportValidationPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyNoIssues(): Promise<void> {
    await expect(
      this.page.getByText(REPORT_VALIDATION.NO_ISSUES_TEXT),
    ).toBeVisible();
  }
}
