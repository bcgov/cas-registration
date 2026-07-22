import { APIRequestContext, Page, expect } from "@playwright/test";
import {
  PAY_OBLIGATION_SCENARIO,
  PAY_OBLIGATION_TRACK_PAYMENTS_URL_PATTERN,
} from "@/compliance-e2e/utils/constants";
import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";
import { getCrvIdFromUrl } from "@bciers/e2e/utils/helpers";

export interface ObligationPayment {
  amount: string;
  received_date: string;
  method?: string;
  receipt_number?: string;
}

// Matches PayObligationScenario.DEFAULT_PAYMENTS in pay_obligation.py - two
// partial payments that leave a balance owing.
export const PARTIAL_OBLIGATION_PAYMENTS: ObligationPayment[] = [
  {
    amount: "500000.00",
    received_date: "2025-12-18",
    method: "Wire Transfer",
    receipt_number: "E2E-RECEIPT-001",
  },
  {
    amount: "300000.00",
    received_date: "2025-12-20",
    method: "Wire Transfer",
    receipt_number: "E2E-RECEIPT-002",
  },
];

// The above two payments plus a third one that covers the remaining balance
// (they sum to $1,000,968.64, the OBLIGATION_NOT_MET fixture's initial
// balance - see _INITIAL_OUTSTANDING in
// bc_obps/compliance/api/e2e_integration_stub/mocking/http_mocks.py), so the
// obligation is fully paid off.
export const FULL_OBLIGATION_PAYMENTS: ObligationPayment[] = [
  ...PARTIAL_OBLIGATION_PAYMENTS,
  {
    amount: "200968.64",
    received_date: "2025-12-22",
    method: "Wire Transfer",
    receipt_number: "E2E-RECEIPT-003",
  },
];

export class TrackPaymentsPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Records payments against the obligation via the Django e2e stub.
   *
   * Payments are made externally in eLicensing, which E2E can't reach, so the
   * stub writes the payment records and reduces the invoice balance directly.
   * Defaults to PARTIAL_OBLIGATION_PAYMENTS, leaving a balance owing.
   */
  async recordObligationPayments(
    apiContext: APIRequestContext,
    payments?: ObligationPayment[],
  ) {
    const crvId = getCrvIdFromUrl({ url: this.page.url() });
    await attachE2EStubEndpoint(
      this.page,
      apiContext,
      () => ({
        scenario: PAY_OBLIGATION_SCENARIO,
        compliance_report_version_id: Number(crvId),
        payload: payments ? { payments } : {},
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

  /**
   * Assert the PaymentStatusNote shows the "outstanding balance owing" message.
   * Only differs visually from the fully paid message, so this and
   * assertShowsFullyPaidStatus must both be exercised
   */
  async assertShowsOutstandingBalanceStatus() {
    await expect(
      this.page.getByText(/please pay the outstanding compliance obligation/i),
    ).toBeVisible();
  }

  /**
   * Assert the PaymentStatusNote shows the "fully met" success message.
   */
  async assertShowsFullyPaidStatus() {
    await expect(
      this.page.getByText(/your compliance obligation has been fully met/i),
    ).toBeVisible();
  }
}
