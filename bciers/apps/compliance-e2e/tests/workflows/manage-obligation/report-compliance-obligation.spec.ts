import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { GridReportingCurrentReportsPOM } from "@/reporting-e2e/poms/grid-reporting-current-reports";
import { GridComplianceSummariesPOM } from "@/compliance-e2e/poms/grid-compliance-summaries";
import { ComplianceOperations } from "@/compliance-e2e/utils/enums";

// const happoPlaywright = require("happo-playwright");
// 👤 run test using the storageState for role UserRole.INDUSTRY_USER_ADMIN
const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });

test.describe("Compliance report version manage obligation flow", () => {
  test("creates a compliance report version for an obligation-not-met report", async ({
    page,
  }) => {
    // Submit the report for "Obligation not met"
    const gridReportingReports = new GridReportingCurrentReportsPOM(page);
    await gridReportingReports.submitReportObligation();

    // Navigate to the compliance summaries grid
    const gridComplianceSummaries = new GridComplianceSummariesPOM(page);
    await gridComplianceSummaries.route();

    // Assert the compliance report version record exists with the expected Operation Name
    await gridComplianceSummaries.getRowByOperationName(
      ComplianceOperations.OBLIGATION_NOT_MET,
    );

    // Assert the record has expected status
    await gridComplianceSummaries.assertStatusForOperation(
      ComplianceOperations.OBLIGATION_NOT_MET,
      "Obligation not met",
    );
  });
});
