import { APIRequestContext, expect, Locator, Page } from "@playwright/test";
import {
  TRACK_STATUS_OF_ISSUANCE_URL_PATTERN,
  BCCR_HOLDING_ACCOUNT_INPUT,
  BCCR_TRADING_NAME_FIELD,
  ISSUANCE_STATUS_FIELD,
  EARNED_CREDITS_PUT_ROUTE_PATTERN,
  EARNED_CREDITS_CRV_ID_REGEX,
  E2E_INTEGRATION_STUB_PATH,
  EARNED_CREDITS_REQUEST_ISSUANCE_SCENARIO,
  REQUEST_ISSUANCE_BUTTON_TEXT,
} from "@/compliance-e2e/utils/constants";

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
   */ async attachBccrAccountValidationStub(
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
   * Attach a route that intercepts the PUT /earned-credits call
   * and delegates to the Django /e2e-integration-stub endpoint.
   */
  async attachRequestIssuanceStub(
    api: APIRequestContext,
    baseURL: string,
  ): Promise<void> {
    await this.page.route(EARNED_CREDITS_PUT_ROUTE_PATTERN, async (route) => {
      const req = route.request();
      const url = req.url();
      const method = req.method();
      const body = (req.postDataJSON?.() ?? {}) as Record<string, unknown>;

      if (method !== "PUT") {
        return route.continue();
      }

      const match = url.match(EARNED_CREDITS_CRV_ID_REGEX);
      const crvId = match?.[1];

      if (!crvId) {
        throw new Error(
          `Could not extract compliance_report_version_id from URL: ${url}`,
        );
      }

      const stubResponse = await api.post(
        `${baseURL}${E2E_INTEGRATION_STUB_PATH}`,
        {
          data: {
            scenario: EARNED_CREDITS_REQUEST_ISSUANCE_SCENARIO,
            compliance_report_version_id: Number(crvId),
            payload: body,
          },
        },
      );

      if (!stubResponse.ok()) {
        const text = await stubResponse.text();
        throw new Error(
          `Stub endpoint failed: ${stubResponse.status()} – ${text}`,
        );
      }

      const json = await stubResponse.json();

      await route.fulfill({
        status: stubResponse.status(),
        contentType: "application/json",
        body: JSON.stringify(json),
      });
    });
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

    // Triggers the widget's onChange -> validateBccrAccount -> getBccrAccountDetails
    await this.holdingAccountInput.fill(holdingAccountId);
    await this.waitForTradingName();
  }

  async submitRequestIssuance(): Promise<void> {
    const labelRegex = new RegExp(REQUEST_ISSUANCE_BUTTON_TEXT, "i");

    const submitButton = this.page
      .locator("form")
      .getByRole("button", { name: labelRegex });

    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    await Promise.all([
      this.page.waitForURL(TRACK_STATUS_OF_ISSUANCE_URL_PATTERN),
      submitButton.click(),
    ]);
  }
}
