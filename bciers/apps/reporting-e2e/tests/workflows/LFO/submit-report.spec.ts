import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });
test.describe("Test Submit LFO report", () => {
  test("Submit LFO report", async ({ page, happoScreenshot }) => {
    const reportingPage = new CurrentReportsPOM(page);

    await reportingPage.route();

    reportingPage.startNewReport("E2E LFO");
  });
});
