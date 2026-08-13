import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { runLfoSubmitReport } from "@/reporting-e2e/tests/workflows/submit/lfo";
import {
  runLfoSupplementaryScenario,
  lfoSupplementaryScenarios,
} from "@/reporting-e2e/tests/workflows/supplementary/lfo";

// fixedClock: the sign-off page renders today's date client-side, which would
// otherwise churn its Happo baseline daily
const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN, {
  fixedClock: true,
});

test.describe.configure({ mode: "serial" });

test.describe("LFO: create and submit a new report for the current reporting year", () => {
  test("Industry user starts, fills, and submits a new LFO report", async ({
    page,
    request,
    happoScreenshot,
  }) => {
    await runLfoSubmitReport({ page, request, happoScreenshot });
  });
});

test.describe("LFO: create and submit a supplementary report", () => {
  for (const scenario of lfoSupplementaryScenarios) {
    test(scenario.title, async ({ page, request, happoScreenshot }) => {
      await runLfoSupplementaryScenario({
        page,
        request,
        scenario,
        happoScreenshot,
      });
    });
  }
});
