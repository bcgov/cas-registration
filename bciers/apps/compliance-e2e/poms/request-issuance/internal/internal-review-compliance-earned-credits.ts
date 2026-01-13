import { APIRequestContext, expect, Locator, Page } from "@playwright/test";
import {
  CONTINUE_BUTTON_TEXT,
  ANALYST_SUGGESTION_INPUT,
  EARNED_CREDITS_DIRECTOR_APPROVE_SCENARIO,
  DECISION_TO_BUTTON,
  DirectorDecision,
} from "@/compliance-e2e/utils/constants";
import { clickButton } from "@bciers/e2e/utils/helpers";
import { AnalystSuggestion } from "@bciers/utils/src/enums";
import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";
import { getCrvIdFromUrl } from "@bciers/e2e/utils/helpers";

export class InternalReviewComplianceEarnedCreditsPOM {
  private readonly page: Page;

  private readonly analystSuggestionInput: Locator;

  constructor(page: Page) {
    this.page = page;

    this.analystSuggestionInput = this.page.locator(ANALYST_SUGGESTION_INPUT);
  }

  /**
   * Analyst flow: submits the analyst review
   */
  async submitAnalystReviewRequestIssuance(): Promise<void> {
    // Assert the analyst suggestion is READY_TO_APPROVE
    const group = this.analystSuggestionInput;
    await expect(group).toBeVisible();

    const selectedText = await group
      .locator('label:has(input[type="radio"]:checked)')
      .innerText();

    expect(selectedText).toMatch(
      new RegExp(AnalystSuggestion.READY_TO_APPROVE, "i"),
    );

    // Click submit and wait for navigation
    await clickButton(this.page, CONTINUE_BUTTON_TEXT);
  }

  /**
   * Director flow: director decision is Approved
   */
  async approveIssuanceDirect(apiContext: APIRequestContext): Promise<void> {
    const crvId = getCrvIdFromUrl({ url: this.page.url() });
    // 🔌 Attach stub API - required for APPROVE (mocks BCCR API)
    await attachE2EStubEndpoint(
      this.page,
      apiContext,
      () => ({
        scenario: EARNED_CREDITS_DIRECTOR_APPROVE_SCENARIO,
        compliance_report_version_id: crvId,
        payload: {},
      }),
      EARNED_CREDITS_DIRECTOR_APPROVE_SCENARIO,
    );
  }

  /**
   * Director flow: submits the director decision
   */
  async submitDirectorReviewIssuance(
    decision: DirectorDecision,
  ): Promise<void> {
    await clickButton(this.page, DECISION_TO_BUTTON[decision]);
  }
}
