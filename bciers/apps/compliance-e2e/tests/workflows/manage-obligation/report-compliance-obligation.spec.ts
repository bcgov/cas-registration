import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  ComplianceOperations,
  ComplianceDisplayStatus,
  GridActionText,
} from "@/compliance-e2e/utils/enums";
import { REVIEW_OBLIGATION_URL_PATTERN } from "@/compliance-e2e/utils/constants";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ManageObligationTaskListPOM } from "@/compliance-e2e/poms/manage-obligation/tasklist";
import { PaymentInstructionsPOM } from "@/compliance-e2e/poms/manage-obligation/payment-instructions";

// 👤 run test using the storageState for role UserRole.INDUSTRY_USER_ADMIN
const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });
test.describe("Test compliance report version manage obligation flow", () => {
  test("Submits an Obligation report and verifies status in Compliance Summary grid", async ({
    page,
    request,
  }) => {
    const gridReportingReports = new CurrentReportsPOM(page);

    // 🔌 wire the stub before submitting the report
    await gridReportingReports.attachSubmitReportStub(request);

    await gridReportingReports.submitReportObligation();

    // Navigate to the compliance summaries grid
    const gridComplianceSummaries = new ComplianceSummariesPOM(page);
    await gridComplianceSummaries.route();

    // Assert the compliance report version record exists and has expected status
    await gridComplianceSummaries.assertStatusForOperation(
      ComplianceOperations.OBLIGATION_NOT_MET,
      ComplianceDisplayStatus.OBLIGATION_NOT_MET,
    );

    // Open the "Manage Obligation" action for that operation
    await gridComplianceSummaries.openActionForOperation({
      operationName: ComplianceOperations.OBLIGATION_NOT_MET,
      linkName: GridActionText.MANAGE_OBLIGATION,
      urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
    });

    // From the Manage Obligation task list, click "Download Payment Instructions"
    const taskListManageObligation = new ManageObligationTaskListPOM(page);
    await taskListManageObligation.clickDownloadPaymentInstructions();

    // Assert the record has an invoice number
    const paymentInstructions = new PaymentInstructionsPOM(page);
    await paymentInstructions.assertHasInvoiceNumber();
  });
});
