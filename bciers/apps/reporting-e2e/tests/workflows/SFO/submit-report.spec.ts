import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { runSfoSubmitReport } from "@/reporting-e2e/tests/workflows/submit/sfo";
import {
  runSfoSupplementaryScenario,
  sfoSupplementaryScenarios,
} from "@/reporting-e2e/tests/workflows/supplementary/sfo";

// fixedClock: the sign-off page renders today's date client-side, which would
// otherwise churn its Happo baseline daily
const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN, {
  fixedClock: true,
});

test.describe.configure({ mode: "serial" });

test.describe("SFO: create and submit a new report for the current reporting year", () => {
  test("Industry user starts, fills, and submits a new SFO report", async ({
    page,
    request,
    happoScreenshot,
  }) => {
    await runSfoSubmitReport({ page, request, happoScreenshot });
  });
});

test.describe("SFO: create and submit a supplementary report", () => {
  for (const scenario of sfoSupplementaryScenarios) {
    test(scenario.title, async ({ page, request, happoScreenshot }) => {
      await runSfoSupplementaryScenario({
        page,
        request,
        scenario,
        happoScreenshot,
      });
    });
  }
});
