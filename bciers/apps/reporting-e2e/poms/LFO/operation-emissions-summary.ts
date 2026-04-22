import { FORM_BUTTON_TEXT } from "@/reporting-e2e/utils/constants";
import { clickButton } from "@bciers/e2e/utils/helpers";
import { expect, Page } from "@playwright/test";

export class OperationEmissionSummaryPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async validateEmissionSummary() {
    await expect(this.page.getByText("Stationary")).toBeVisible();
  }

  async continue(waitForURL: RegExp) {
    await clickButton(this.page, FORM_BUTTON_TEXT.CONTINUE, {
      waitForUrl: waitForURL,
    });
  }
}
