import { APIRequestContext, expect, Locator, Page } from "@playwright/test";
import {
  BCCR_HOLDING_ACCOUNT_INPUT,
  BCCR_TRADING_NAME_FIELD,
  ISSUANCE_STATUS_FIELD,
  EARNED_CREDITS_REQUEST_ISSUANCE_SCENARIO,
  REQUEST_ISSUANCE_BUTTON_TEXT,
  EARNED_CREDITS_REQUEST_ISSUANCE_CRV_ID,
  REQUEST_ISSUANCE_CREDITS_URL_PATTERN,
} from "@/compliance-e2e/utils/constants";
import { clickButton } from "@bciers/e2e/utils/helpers";
import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";

export class ReviewComplianceEarnedCreditsPOM {
  private readonly page: Page;

  private readonly issuanceStatusField: Locator;

  private readonly holdingAccountInput: Locator;

  private readonly tradingNameField: Locator;

  constructor(page: Page) {
    this.page = page;

    this.issuanceStatusField = this.page.locator(ISSUANCE_STATUS_FIELD);
    this.holdingAccountInput = this.page.locator(BCCR_HOLDING_ACCOUNT_INPUT);
    this.tradingNameField = this.page.locator(BCCR_TRADING_NAME_FIELD);
  }

  /**
   * Injects a global browser hook that overrides validateBccrAccount in BccrHoldingAccountWidget
   * via window.__E2E_VALIDATE_BCCR_ACCOUNT__.
   *
   */
  async attachBccrAccountValidationStub(
    mockTradingName = "Mock Trading Name Inc.",
  ): Promise<void> {
    const context = this.page.context();

    await context.addInitScript((name: string) => {
      (window as any).__E2E_VALIDATE_BCCR_ACCOUNT__ = async () => {
        return {
          bccr_trading_name: name,
          error: undefined,
        };
      };
    }, mockTradingName);
  }

  /**
   * Attach a route so to intercept the action handler submit call
   * and delegate to the Django /e2e-integration-stub endpoint.
   */
  async attachRequestIssuanceStub(api: APIRequestContext): Promise<void> {
    await attachE2EStubEndpoint(
      this.page,
      api,
      REQUEST_ISSUANCE_CREDITS_URL_PATTERN,
      ({ url, body }) => {
        const match = url.match(EARNED_CREDITS_REQUEST_ISSUANCE_CRV_ID);
        const crvId = match?.[1];
        if (!crvId) throw new Error(`Could not extract crvId from URL: ${url}`);

        return {
          scenario: EARNED_CREDITS_REQUEST_ISSUANCE_SCENARIO,
          compliance_report_version_id: Number(crvId),
          payload: body,
        };
      },
      async ({ route, stubResponse, json }) => {
        await route.fulfill({
          status: stubResponse.status(),
          contentType: "application/json",
          body: JSON.stringify(json),
        });
      },
      EARNED_CREDITS_REQUEST_ISSUANCE_SCENARIO,
    );
  }

  private async readIssuanceStatusText(): Promise<string> {
    await this.issuanceStatusField.waitFor();
    const text = (await this.issuanceStatusField.textContent()) ?? "";
    return text.trim();
  }

  async assertIssuanceStatusValue(expected: string): Promise<void> {
    await expect(this.issuanceStatusField).toBeVisible();
    const text = await this.readIssuanceStatusText();
    await expect(text).toBe(expected);
  }

  private async waitForTradingName(): Promise<void> {
    await expect(this.tradingNameField).toBeVisible();
  }

  async fillRequestIssuanceForm(holdingAccountId: string): Promise<void> {
    await expect(this.holdingAccountInput).toBeVisible();
    await this.holdingAccountInput.fill(holdingAccountId);
    await this.waitForTradingName();
  }

  async submitRequestIssuance(): Promise<void> {
    await clickButton(this.page, REQUEST_ISSUANCE_BUTTON_TEXT, {
      inForm: true,
    });
  }
}
