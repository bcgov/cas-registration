import { Page, expect } from "@playwright/test";

/**
 * Industry-facing "Track Status of Issuance" detail page
 * (apps/compliance/.../request-issuance/track-status-of-issuance).
 */
export class TrackStatusOfIssuancePOM {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async assertShowsDeclinedNote(): Promise<void> {
    await expect(
      this.page.getByText(/your request is declined/i),
    ).toBeVisible();
    await expect(
      this.page.getByRole("link", { name: /B\.C\. Carbon Registry/i }),
    ).toBeVisible();
  }
}
