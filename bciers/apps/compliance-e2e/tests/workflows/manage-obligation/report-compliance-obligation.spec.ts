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
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";

// 👤 run test using the storageState for role UserRole.INDUSTRY_USER_ADMIN
const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });
test.describe("Test compliance report version manage obligation flow", () => {
  test("Submits an Obligation report and verifies status in Compliance Summary grid", async ({
    page,
    request,
    happoScreenshot,
  }) => {
    // 🔌 wire the stub before submitting the report
    const gridReportingReports = new CurrentReportsPOM(page);
    await gridReportingReports.attachSubmitReportStub(request);

    // Submit obligation report
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

    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Compliance obligation not met",
      variant: "default",
    });

    // From the Manage Obligation task list, click "Download Payment Instructions"
    const taskListManageObligation = new ManageObligationTaskListPOM(page);
    await taskListManageObligation.clickDownloadPaymentInstructions();

    // Assert the record has an invoice number related to this obligation
    const paymentInstructions = new PaymentInstructionsPOM(page);
    await paymentInstructions.assertHasInvoiceNumber();

    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Compliance obligation not met",
      variant: "download payment instructions",
    });
  });
});
