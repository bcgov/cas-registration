import { APIRequestContext, expect, Locator, Page } from "@playwright/test";
import {
  CONTINUE_BUTTON_TEXT,
  ANALYST_SUGGESTION_INPUT,
  DIRECTOR_REVIEW_CRV_ID,
  EARNED_CREDITS_DIRECTOR_APPROVE_SCENARIO,
  REVIEW_BY_DIRECTOR_URL_PATTERN,
  DECISION_TO_BUTTON,
  DirectorDecision,
} from "@/compliance-e2e/utils/constants";

import { clickButton } from "@bciers/e2e/utils/helpers";
import { attachE2EStubEndpoint } from "@bciers/e2e/utils/e2eStubEndpoint";
import { AnalystSuggestion } from "@bciers/utils/src/enums";

export class InternalReviewComplianceEarnedCreditsPOM {
  private readonly page: Page;

  private readonly analystSuggestionInput: Locator;

  constructor(page: Page) {
    this.page = page;

    this.analystSuggestionInput = this.page.locator(ANALYST_SUGGESTION_INPUT);
  }

  /**
   * Attach a route to intercept the director APPROVE decision and mock BCCR API calls.
   * Only needed for APPROVE - DECLINE doesn't call BCCR so uses the real endpoint.
   */
  async attachDirectorApproveStub(api: APIRequestContext): Promise<void> {
    await attachE2EStubEndpoint(
      this.page,
      api,
      REVIEW_BY_DIRECTOR_URL_PATTERN,

      ({ url, body }) => {
        const match = url.match(DIRECTOR_REVIEW_CRV_ID);
        const crvId = match?.[1];

        if (!crvId) throw new Error(`Could not extract crvId from URL: ${url}`);

        const payload = {
          scenario: EARNED_CREDITS_DIRECTOR_APPROVE_SCENARIO,
          compliance_report_version_id: Number(crvId),
          payload: body,
        };

        return payload;
      },

      async ({ route, stubResponse, json }) => {
        await route.fulfill({
          status: stubResponse.status(),
          contentType: "application/json",
          body: JSON.stringify(json),
        });
      },

      "earned_credits_director_approve",
    );
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
   * Director flow: submits the director decision
   */
  async submitDirectorReviewIssuance(
    decision: DirectorDecision,
  ): Promise<void> {
    await clickButton(this.page, DECISION_TO_BUTTON[decision]);
  }
}
