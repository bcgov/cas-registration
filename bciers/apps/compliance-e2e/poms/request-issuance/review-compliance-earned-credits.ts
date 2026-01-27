import { APIRequestContext, expect, Locator, Page } from "@playwright/test";
import {
  ISSUANCE_STATUS_FIELD,
  EARNED_CREDITS_REQUEST_ISSUANCE_SCENARIO,
  BCCR_HOLDING_ACCOUNT_INPUT_VALUE,
  BCCR_TRADING_NAME_FIELD_VALUE,
  REQUEST_ISSUANCE_BUTTON_TEXT,
} from "@/compliance-e2e/utils/constants";
import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";
import { getCrvIdFromUrl } from "@bciers/e2e/utils/helpers";

export class ReviewComplianceEarnedCreditsPOM {
  private readonly page: Page;

  private readonly issuanceStatusField: Locator;
  private readonly requestIssuanceButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.issuanceStatusField = this.page.locator(ISSUANCE_STATUS_FIELD);
    this.requestIssuanceButton = this.page.getByRole("button", {
      name: REQUEST_ISSUANCE_BUTTON_TEXT,
      exact: true,
    });
  }

  async assertIssuanceStatusValue(expected: string): Promise<void> {
    await expect(this.issuanceStatusField).toBeVisible();
    await expect(this.issuanceStatusField).toHaveText(expected);
  }

  async assertRequestIssuanceButtonVisible(
    shouldBeVisible = true,
  ): Promise<void> {
    if (shouldBeVisible) {
      await expect(this.requestIssuanceButton).toBeVisible();
    } else {
      await expect(this.requestIssuanceButton).not.toBeVisible();
    }
  }

  /**
   * Industry flow: submits request of issuance for the earned credits
   */
  async submitRequestIssuance(apiContext: APIRequestContext): Promise<void> {
    const crvId = getCrvIdFromUrl({ url: this.page.url() });
    // 🔌 Attach stub API
    await attachE2EStubEndpoint(
      this.page,
      apiContext,
      () => ({
        scenario: EARNED_CREDITS_REQUEST_ISSUANCE_SCENARIO,
        compliance_report_version_id: Number(crvId),
        payload: {
          bccr_holding_account_id: BCCR_HOLDING_ACCOUNT_INPUT_VALUE,
          bccr_trading_name: BCCR_TRADING_NAME_FIELD_VALUE,
        },
      }),
      EARNED_CREDITS_REQUEST_ISSUANCE_SCENARIO,
    );
  }
}
