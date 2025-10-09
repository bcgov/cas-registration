import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  takeStabilizedScreenshot,
  submitReport,
} from "@bciers/e2e/utils/helpers";
import { CompliancePOM } from "../poms/compliance";
import { Operations } from "../utils/enums";

const happoPlaywright = require("happo-playwright");
const test = setupBeforeEachTest(UserRole.INDUSTRY_USER_ADMIN);

test.beforeEach(async () => {
  await submitReport(4); // Earned credits
});
// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Earned credits", () => {
  test("Verify presence of record in Compliance Summaries grid", async ({
    page,
  }) => {
    const compliancePage = new CompliancePOM(page);
    await compliancePage.routeToComplianceSummariesGrid();

    const row = await compliancePage.searchOperationByName(
      Operations.EARNED_CREDITS,
    );
    // Verify status
    const status = await compliancePage.getValueByCellSelector(row, "status");

    // Verify correct action
    await compliancePage.assertActionIsCorrect(row, status);

    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Compliance Summaries grid",
      variant: "default",
    });
  });
});
