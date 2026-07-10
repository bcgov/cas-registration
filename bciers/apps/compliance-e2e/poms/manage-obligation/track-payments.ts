import { APIRequestContext, Page, expect } from "@playwright/test";
import {
  PAY_OBLIGATION_SCENARIO,
  PAY_OBLIGATION_TRACK_PAYMENTS_URL_PATTERN,
} from "@/compliance-e2e/utils/constants";
import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";
import { getCrvIdFromUrl } from "@bciers/e2e/utils/helpers";

export class TrackPaymentsPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Records partial payments against the obligation via the Django e2e stub.
   *
   * Payments are made externally in eLicensing, which E2E can't reach, so the
   * stub writes the payment records and reduces the invoice balance directly.
   */
  async recordObligationPayments(apiContext: APIRequestContext) {
    const crvId = getCrvIdFromUrl({ url: this.page.url() });
    await attachE2EStubEndpoint(
      this.page,
      apiContext,
      () => ({
        scenario: PAY_OBLIGATION_SCENARIO,
        compliance_report_version_id: Number(crvId),
        payload: {},
      }),
      PAY_OBLIGATION_SCENARIO,
    );
  }

  /**
   * Clicks the "Continue" button on the download-payment-instructions page and
   * waits for the URL to reach the pay-obligation-track-payments route.
   *
   * Uses expect.toPass to retry the entire "locate + click + navigate" block.
   */
  async continueToTrackPayments(options?: { timeout?: number }) {
    const timeout = options?.timeout ?? 30_000;

    await expect(async () => {
      const button = this.page.getByRole("button", { name: /continue/i });
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();

      await Promise.all([
        this.page.waitForURL(PAY_OBLIGATION_TRACK_PAYMENTS_URL_PATTERN, {
          timeout,
        }),
        button.click(),
      ]);

      await expect(this.page).toHaveURL(
        PAY_OBLIGATION_TRACK_PAYMENTS_URL_PATTERN,
      );
    }).toPass({ timeout });
  }

  /**
   * Assert the track-payments page has loaded by checking for its
   * "Outstanding Compliance Obligation" section header.
   */
  async assertPageLoaded() {
    await expect(
      this.page.getByText("Outstanding Compliance Obligation", { exact: true }),
    ).toBeVisible();
  }

  /**
   * Assert the Payments section rendered the two recorded payment records.
   */
  async assertHasPayments() {
    await expect(this.page.getByText("Payment 1")).toBeVisible();
    await expect(this.page.getByText("Payment 2")).toBeVisible();
  }
}
