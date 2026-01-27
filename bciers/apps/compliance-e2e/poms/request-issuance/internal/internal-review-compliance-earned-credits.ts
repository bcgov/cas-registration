import { APIRequestContext, expect, Locator, Page } from "@playwright/test";
import {
  CONTINUE_BUTTON_TEXT,
  ANALYST_SUGGESTION_INPUT,
  EARNED_CREDITS_DIRECTOR_APPROVE_SCENARIO,
  DECISION_TO_BUTTON,
  DirectorDecision,
  REVIEW_BY_DIRECTOR_URL_PATTERN,
} from "@/compliance-e2e/utils/constants";
import { clickButton } from "@bciers/e2e/utils/helpers";
import { AnalystSuggestion, IssuanceStatus } from "@bciers/utils/src/enums";
import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";
import { getCrvIdFromUrl } from "@bciers/e2e/utils/helpers";

export class InternalReviewComplianceEarnedCreditsPOM {
  private readonly page: Page;

  // Analyst sugestion control
  private readonly analystSuggestionInput: Locator;
  // Director decision controls
  private readonly approveButton: Locator;
  private readonly declineButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.analystSuggestionInput = this.page.locator(ANALYST_SUGGESTION_INPUT);

    this.approveButton = this.page.getByRole("button", {
      name: DECISION_TO_BUTTON[IssuanceStatus.APPROVED],
    });

    this.declineButton = this.page.getByRole("button", {
      name: DECISION_TO_BUTTON[IssuanceStatus.DECLINED],
    });
  }

  async assertAnalystSuggestionValue(expected: RegExp | string): Promise<void> {
    // ✅ Assert expected value
    await expect(this.analystSuggestionInput).toBeVisible();
    await expect(this.analystSuggestionInput).toHaveText(expected);
  }

  async assertDirectorDecisionButtonsVisible(
    isVisible: boolean,
  ): Promise<void> {
    if (isVisible) {
      // ✅ Assert buttons visible
      await expect(this.approveButton).toBeVisible();
      await expect(this.declineButton).toBeVisible();
    } else {
      // ❌ Assert NO buttons
      await expect(this.approveButton).toHaveCount(0);
      await expect(this.declineButton).toHaveCount(0);
    }
  }

  /**
   * Analyst flow: submits the analyst review
     Submits the analyst suggestion to update_compliance_report_version_earned_credit
   */
  async submitAnalystReviewRequestIssuance(
    suggestion: AnalystSuggestion = AnalystSuggestion.READY_TO_APPROVE,
  ): Promise<void> {
    const group = this.analystSuggestionInput;
    await expect(group).toBeVisible();

    // Select the requested suggestion
    const option = group.locator("label", {
      hasText: new RegExp(suggestion, "i"),
    });
    await expect(option).toBeVisible();
    await option.click();

    // ✅ Assert the selected suggestion matches the suggestion prop
    const selectedText = await group
      .locator('label:has(input[type="radio"]:checked)')
      .innerText();

    expect(selectedText).toMatch(new RegExp(suggestion, "i"));

    // Click submit and wait for navigation
    await clickButton(this.page, CONTINUE_BUTTON_TEXT, {
      waitForUrl: REVIEW_BY_DIRECTOR_URL_PATTERN,
    });

    // ✅ Assert the route
    await expect(this.page).toHaveURL(REVIEW_BY_DIRECTOR_URL_PATTERN);
  }

  /**
   * Director flow: submits director decision Approved to run_e2e_integration_stub
   */
  async approveIssuanceDirect(apiContext: APIRequestContext): Promise<void> {
    const crvId = getCrvIdFromUrl({ url: this.page.url() });

    await attachE2EStubEndpoint(
      this.page,
      apiContext,
      () => ({
        scenario: EARNED_CREDITS_DIRECTOR_APPROVE_SCENARIO,
        compliance_report_version_id: crvId,
        payload: {
          director_decision: IssuanceStatus.APPROVED,
          director_comment: "E2E approved",
        },
      }),
      EARNED_CREDITS_DIRECTOR_APPROVE_SCENARIO,
    );
  }

  /**
   * Director flow: submits the director decision to update_compliance_report_version_earned_credit
   */
  async submitDirectorReviewIssuance(
    decision: DirectorDecision,
  ): Promise<void> {
    await clickButton(this.page, DECISION_TO_BUTTON[decision]);
  }
}
