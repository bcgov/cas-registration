import { Page, expect } from "@playwright/test";
import { fillComboxboxWidget } from "@bciers/e2e/utils/helpers";
import { AppRoutes } from "@/reporting-e2e/utils/enums";
import { FORM_BUTTON_TEXT } from "@/reporting-e2e/utils/constants";

export class StartPastReportPOM {
  constructor(private readonly page: Page) {}

  async isLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(`${AppRoutes.PAGE_START_PAST_REPORT}$`),
    );

    await expect(
      this.page.getByRole("button", {
        name: FORM_BUTTON_TEXT.START,
      }),
    ).toBeVisible();
  }

  async selectReportingYear(year: string): Promise<void> {
    await fillComboxboxWidget(this.page, /select reporting year/i, year, true);
  }

  async selectOperation(operation: string): Promise<void> {
    await fillComboxboxWidget(this.page, /select operation/i, operation, true);
  }

  async selectRegistrationPurpose(purpose: string): Promise<void> {
    await fillComboxboxWidget(
      this.page,
      /select the registration/i,
      purpose,
      true,
    );
  }

  async clickStart(): Promise<void> {
    await this.page
      .getByRole("button", {
        name: FORM_BUTTON_TEXT.START,
      })
      .click();
  }

  async clickCancel(): Promise<void> {
    await this.page
      .getByRole("button", {
        name: FORM_BUTTON_TEXT.CANCEL,
      })
      .click();
  }
}
