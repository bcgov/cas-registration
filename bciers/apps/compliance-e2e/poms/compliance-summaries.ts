import { Locator, Page, expect } from "@playwright/test";
import {
  AppRoutes,
  ComplianceSummariesGridHeaders,
} from "@/compliance-e2e/utils/enums";
import {
  GRID_ROOT,
  COMPLIANCE_SUMMARIES_BASE_PATH,
  COMPLIANCE_SUMMARIES_TAB,
} from "@/compliance-e2e/utils/constants";

type RouteOptions = {
  timeout?: number;
  ensureSummariesNav?: boolean;
  dataUrlPattern?: RegExp;
};

export class ComplianceSummariesPOM {
  readonly page: Page;

  readonly url: string =
    process.env.E2E_BASEURL + AppRoutes.GRID_COMPLIANCE_SUMMARIES;

  constructor(page: Page) {
    this.page = page;
  }

  // -----------------
  // locators
  // -----------------

  private gridRoot(): Locator {
    return this.page.locator(GRID_ROOT).first();
  }

  private grid(): Locator {
    return this.gridRoot().locator('[role="grid"]').first();
  }

  // -----------------
  // readiness helpers
  // -----------------

  private async assertOnComplianceSummariesRoute(timeout: number) {
    const basePathRegex = new RegExp(
      `${COMPLIANCE_SUMMARIES_BASE_PATH}(?:/|$)`,
    );
    await expect(this.page).toHaveURL(basePathRegex, { timeout });
  }

  /**
   * Some layouts render the grid only after selecting a "Compliance Summaries" nav/tab.
   * Safe no-op if the link isn't present/visible.
   */
  private async ensureComplianceSummariesNavActive(options?: {
    timeout?: number;
  }): Promise<void> {
    const timeout = options?.timeout ?? 10_000;

    const summariesNavLink = this.page.getByRole("link", {
      name: /compliance summaries/i,
    });

    await expect(async () => {
      const count = await summariesNavLink.count();
      if (count === 0) return;

      const visible = await summariesNavLink.isVisible();
      if (!visible) return;

      await summariesNavLink.click({ timeout });

      await expect(
        this.page.getByText(/compliance summaries/i).first(),
      ).toBeVisible();
    }).toPass({ timeout });
  }

  /**
   * Readiness signal: wait for at least one successful GET response matching pattern.
   */
  private async waitForDataResponse(
    pattern: RegExp,
    timeout: number,
  ): Promise<void> {
    await expect(async () => {
      const resp = await this.page.waitForResponse(
        (r) =>
          pattern.test(r.url()) &&
          r.request().method() === "GET" &&
          (r.status() === 200 || r.status() === 304),
        { timeout: Math.min(timeout, 10_000) },
      );

      expect(resp.status()).toBeGreaterThan(0);
    }).toPass({ timeout });
  }

  /**
   * Wait until the grid is actually "ready":
   * - GRID_ROOT exists
   * - root + role=grid visible
   * - (optional) progressbar/spinner is gone
   * - at least one gridcell exists
   *
   * Tolerates re-mounts (e.g. HMR) with re-check of counts on every attempt
   */
  private async waitForGridReady(options?: {
    timeout?: number;
  }): Promise<void> {
    const timeout = options?.timeout ?? 30_000;

    await expect(async () => {
      const rootCount = await this.page.locator(GRID_ROOT).count();
      expect(rootCount).toBeGreaterThan(0);

      await expect(this.gridRoot()).toBeVisible();

      const grid = this.grid();
      const progressbar = grid.locator('[role="progressbar"]');
      const anyCell = grid.locator('[role="gridcell"]').first();

      await expect(grid).toBeVisible();

      if ((await progressbar.count()) > 0) {
        await expect(progressbar).toBeHidden();
      }

      await expect(anyCell).toBeVisible();
    }).toPass({ timeout });
  }

  // -----------------
  // Actions
  // -----------------

  /**
   * Route to compliance summaries and wait for the view + grid to be usable.
   *
   * - waits for main + "Compliance Summaries" text (view mounted) before grid wait
   * - optional nav click (safe no-op)
   * - optional data response wait
   * - grid wait tolerates late mount / re-mount
   */
  async route(options?: RouteOptions) {
    const timeout = options?.timeout ?? 30_000;
    const ensureSummariesNav = options?.ensureSummariesNav ?? true;

    await this.page.goto(this.url, { waitUntil: "domcontentloaded" });

    // baseline: layout mounted
    await expect(this.page.locator("main")).toBeVisible({ timeout });

    // make sure we're on the correct route
    await this.assertOnComplianceSummariesRoute(timeout);

    // Ensure the summaries section is active if there is a nav/tab
    if (ensureSummariesNav) {
      await this.ensureComplianceSummariesNavActive({
        timeout: Math.min(timeout, 15_000),
      });
    }

    // Ensure the summaries view is actually present (not just layout)
    await expect(
      this.page.getByRole("tab", {
        name: new RegExp(COMPLIANCE_SUMMARIES_TAB, "i"),
      }),
    ).toBeVisible({ timeout });

    // Optional: wait for a known data call that populates the grid
    if (options?.dataUrlPattern) {
      await this.waitForDataResponse(options.dataUrlPattern, timeout);
    }

    // Finally: grid hydration
    await this.waitForGridReady({ timeout });
  }

  async getRowByOperationName(operationName: string): Promise<Locator> {
    await this.waitForGridReady({ timeout: 30_000 });

    await expect(async () => {
      const row = this.grid()
        .getByRole("row")
        .filter({ hasText: operationName })
        .first();

      const matchingRowCount = await row.count();
      const totalRowCount = await this.grid().getByRole("row").count();

      expect(totalRowCount).toBeGreaterThan(0);
      expect(matchingRowCount).toBeGreaterThan(0);
      await expect(row).toBeVisible();

      const cellCount = await row.locator('[role="gridcell"]').count();
      expect(cellCount).toBeGreaterThan(0);
    }).toPass({ timeout: 30_000 });

    return this.grid()
      .getByRole("row")
      .filter({ hasText: operationName })
      .first();
  }

  async getCellTextForOperation(
    operationName: string,
    field: ComplianceSummariesGridHeaders,
  ): Promise<string> {
    const row = await this.getRowByOperationName(operationName);
    const cell = row.locator(`[role="gridcell"][data-field="${field}"]`);

    await expect(cell).toBeVisible();

    const text = (await cell.textContent())?.trim() || "";
    return text;
  }

  async assertStatusForOperation(
    operationName: string,
    expectedStatus: string,
  ): Promise<void> {
    await expect(async () => {
      const status = await this.getCellTextForOperation(
        operationName,
        ComplianceSummariesGridHeaders.DISPLAY_STATUS,
      );
      expect(status).toBe(expectedStatus);
    }).toPass({ timeout: 30_000 });
  }

  async openActionForOperation(options: {
    operationName: string;
    linkName: string | RegExp;
    urlPattern?: string | RegExp;
  }) {
    const { operationName, linkName, urlPattern } = options;

    const row = await this.getRowByOperationName(operationName);
    const actionLink = row.getByRole("link", { name: linkName });

    await expect(async () => {
      const count = await actionLink.count();
      expect(count).toBeGreaterThan(0);
      await expect(actionLink).toBeVisible();
    }).toPass({ timeout: 30_000 });

    const href = await actionLink.getAttribute("href");
    const targetUrl = new URL(href ?? "", this.url).toString();

    await this.page.goto(targetUrl, { waitUntil: "domcontentloaded" });

    if (urlPattern) {
      await expect(this.page).toHaveURL(urlPattern);
    }
  }
}
