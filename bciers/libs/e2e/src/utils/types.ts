import { APIRequestContext, Page } from "@playwright/test";

/**
 * Happo's screenshot fixture, mirroring the signature declared on the test fixtures
 * in `libs/e2e/src/setupTest.ts`.
 *
 * Optional for two reasons: it is a no-op when Happo is disabled, and a helper used
 * as another's setup step is commonly passed `undefined` so the same snapshots aren't
 * submitted to Happo twice in one run. `takeStabilizedScreenshot` returns early on a
 * falsy value, so passing it straight through is always safe.
 */
export type HappoScreenshot =
  | ((
      // Happo types its own fixture loosely; this mirrors it rather than inventing a
      // stricter signature that would fight the library
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      locator: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: any,
    ) => Promise<void>)
  | undefined;

export type WorkflowRunnerArgs = {
  page: Page;
  request: APIRequestContext;
  happoScreenshot: HappoScreenshot;
};
