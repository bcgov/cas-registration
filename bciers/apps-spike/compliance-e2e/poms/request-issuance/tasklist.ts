import { Page, expect } from "@playwright/test";
import { ComplianceTaskTitles } from "@/compliance-e2e/utils/enums";
import { REQUEST_ISSUANCE_CREDITS_URL_PATTERN } from "@/compliance-e2e/utils/constants";

export class RequestIssuanceTaskListPOM {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Clicks the "Request Issuance of Earned Credits" task list item
   * and waits for the URL to reach the route.
   *
   * Uses expect.toPass to retry the entire "find + click + navigate" block,
   * which helps when the task list re-renders / button is briefly disabled /
   * navigation is delayed.
   */
  async clickRequestIssuance(options?: { timeout?: number }) {
    const timeout = options?.timeout ?? 30_000;
    const labelRegex = new RegExp(ComplianceTaskTitles.REQUEST_ISSUANCE, "i");

    await expect(async () => {
      const button = this.page.getByRole("button", { name: labelRegex });
      const count = await button.count().catch(() => 0);

      expect(count).toBeGreaterThan(0);
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();

      // Run click + URL wait together inside the retry block so any transient
      // failures (re-render, detached node, slow nav) get retried cleanly.
      await Promise.all([
        this.page.waitForURL(REQUEST_ISSUANCE_CREDITS_URL_PATTERN, { timeout }),
        button.click(),
      ]);

      await expect(this.page).toHaveURL(REQUEST_ISSUANCE_CREDITS_URL_PATTERN);
    }).toPass({ timeout });
  }
}
