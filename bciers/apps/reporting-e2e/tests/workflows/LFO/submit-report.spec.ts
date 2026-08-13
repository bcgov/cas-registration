import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { runLfoSubmitReport } from "@/reporting-e2e/tests/workflows/submit/lfo";
import {
  runLfoSupplementaryScenario,
  lfoSupplementaryScenarios,
} from "@/reporting-e2e/tests/workflows/supplementary/lfo";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

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
