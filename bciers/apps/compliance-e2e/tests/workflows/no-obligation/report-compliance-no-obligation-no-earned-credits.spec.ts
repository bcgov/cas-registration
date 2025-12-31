import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import {
  ComplianceDisplayStatus,
  ComplianceOperations,
  GridActionText,
} from "@/compliance-e2e/utils/enums";
import {
  NO_OBLIGATION_OR_CREDITS_ALERT_REGEX,
  NO_OBLIGATION_URL_PATTERN,
} from "@/compliance-e2e/utils/constants";
import {
  checkAlertMessage,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });
test.describe("Test compliance report version no obligation or earned credits flow", () => {
  test("Submits a No Obligation or Earned Credits report and verifies status in Compliance Summary grid", async ({
    page,
    happoScreenshot,
  }) => {
    // Submit No Obligation or Earned Credits report
    const gridReportingReports = new CurrentReportsPOM(page);
    await gridReportingReports.submitReportNoObligation();

    // Navigate to Compliance Summaries Page
    const gridComplianceSummaries = new ComplianceSummariesPOM(page);
    await gridComplianceSummaries.route();

    // Assert report status is "No Obligation or Earned Credits"
    await gridComplianceSummaries.assertStatusForOperation(
      ComplianceOperations.NO_OBLIGATION,
      ComplianceDisplayStatus.NO_OBLIGATION,
    );

    // Assert no obligation message is displayed in the details panel
    await gridComplianceSummaries.openActionForOperation({
      operationName: ComplianceOperations.NO_OBLIGATION,
      linkName: GridActionText.VIEW_DETAILS,
      urlPattern: NO_OBLIGATION_URL_PATTERN,
    });
    await checkAlertMessage(page, NO_OBLIGATION_OR_CREDITS_ALERT_REGEX);

    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Compliance no obligation or earned credits",
      variant: "default",
    });
  });
});
