import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  ComplianceOperations,
  ComplianceDisplayStatus,
  GridActionText,
} from "@/compliance-e2e/utils/enums";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ComplianceSetupPOM } from "@/compliance-e2e/poms/compliance-setup";
import { ReportSetUpPOM } from "@/reporting-e2e/poms/report-setup";
import { REVIEW_OBLIGATION_URL_PATTERN } from "@/compliance-e2e/utils/constants";
import { ReviewComplianceObligationPOM } from "@/compliance-e2e/poms/manage-obligation/review-compliance-obligation";
import { ObligationInvoicePOM } from "@/compliance-e2e/poms/manage-obligation/obligation-invoice";

// 👤 run test using the storageState for role UserRole.INDUSTRY_USER_ADMIN
const test = setupBeforeEachTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });
test.describe("Test supplementary compliance report version flow", () => {
  test("submitting a supplementary obligation decrease does not create a new version and does not void the invoice", async ({
    page,
    request,
  }) => {
    test.slow();

    // Preconditions
    const complianceSetupPOM = new ComplianceSetupPOM(page);
    await complianceSetupPOM.primeInvoiceGenerationGate("open");

    const reportSetUpPOM = new ReportSetUpPOM(page);
    await reportSetUpPOM.primeReportingYear("open");

    // Submit obligation
    const gridReportingReports = new CurrentReportsPOM(page);
    await gridReportingReports.submitReportObligation(false, request);

    // Assert versions in summaries grid
    const gridComplianceSummaries = new ComplianceSummariesPOM(page);
    await gridComplianceSummaries.route();

    await gridComplianceSummaries.assertRowCountForOperation({
      operationName: ComplianceOperations.OBLIGATION_NOT_MET,
      expectedCount: 1,
    });

    // Assert BEFORE generate invoice
    const reviewObligationPOM = new ReviewComplianceObligationPOM(page);
    // Open summary and generate invoice
    await gridComplianceSummaries.openActionForOperation({
      operationName: ComplianceOperations.OBLIGATION_NOT_MET,
      linkName: GridActionText.MANAGE_OBLIGATION,
      urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
    });
    // Capture invoice pdf as buffer
    const pdfBuffer = await reviewObligationPOM.generateInvoiceAndGetPdfBuffer(
      2,
      "obligation",
    );
    // create invoice object from buffer
    const invoice = await ObligationInvoicePOM.fromBuffer(pdfBuffer);

    invoice
      .assertHasInvoiceNumber()
      .assertHasFeesAndAdjustments()
      .assertHasAdjustmentLine()
      .assertNotVoid();

    // Submit supplementary decrease
    await gridReportingReports.route();
    await gridReportingReports.supplementaryReportObligationDecrease(request);

    // Assert versions in summaries grid
    await gridComplianceSummaries.route();
    await gridComplianceSummaries.assertRowCountForOperation({
      operationName: ComplianceOperations.OBLIGATION_NOT_MET,
      expectedCount: 1,
    });

    await gridComplianceSummaries.assertStatusForOperation(
      ComplianceOperations.OBLIGATION_NOT_MET,
      ComplianceDisplayStatus.OBLIGATION_NOT_MET,
    );

    // Assert AFTER generate invoice
    await gridComplianceSummaries.openActionForOperation({
      operationName: ComplianceOperations.OBLIGATION_NOT_MET,
      linkName: GridActionText.MANAGE_OBLIGATION,
      urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
    });
  });
});
