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
import {
  INITIAL_OUTSTANDING_BALANCE_REGEX,
  POST_ADJUSTMENT_OUTSTANDING_BALANCE_REGEX,
  REVIEW_OBLIGATION_URL_PATTERN,
} from "@/compliance-e2e/utils/constants";
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

    // PRECONDITIONS:
    // Prime invoice_generation_date DB state so integration is allowed
    const complianceSetupPOM = new ComplianceSetupPOM(page);
    await complianceSetupPOM.primeInvoiceGenerationGate("open");
    // Prime report_open_date DB state so create supplementary is allowed
    const reportSetUpPOM = new ReportSetUpPOM(page);
    await reportSetUpPOM.primeReportingYear("open");

    // Initial report
    const reports = new CurrentReportsPOM(page);
    await reports.submitReportObligation(false, request);

    const summaries = new ComplianceSummariesPOM(page);
    await summaries.route();
    await summaries.assertRowCountForOperation({
      operationName: ComplianceOperations.OBLIGATION_NOT_MET,
      expectedCount: 1,
    });

    await summaries.openActionForOperation({
      operationName: ComplianceOperations.OBLIGATION_NOT_MET,
      linkName: GridActionText.MANAGE_OBLIGATION,
      urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
    });

    // Initial report invoice assertions
    const initialVersionId = Number(
      new URL(page.url()).pathname.split("/").at(-2),
    );

    const reviewObligationPOM = new ReviewComplianceObligationPOM(page);
    const initialPdfBuffer =
      await reviewObligationPOM.generateInvoiceAndGetPdfBuffer(
        initialVersionId,
        "obligation",
      );
    const initialInvoice =
      await ObligationInvoicePOM.fromBuffer(initialPdfBuffer);

    initialInvoice
      .assertHasInvoiceNumber()
      .assertHasFeesAndAdjustments()
      .assertOutstandingBalance(INITIAL_OUTSTANDING_BALANCE_REGEX)
      .assertNotVoid();

    // Supplementary decrease
    await reports.route();
    await reports.supplementaryReportObligationDecrease(request);

    // Assert summaries grid still shows exactly 1 obligation row (no new top-level row)
    await summaries.route();
    await summaries.assertRowCountForOperation({
      operationName: ComplianceOperations.OBLIGATION_NOT_MET,
      expectedCount: 1,
    });
    await summaries.assertStatusForOperation(
      ComplianceOperations.OBLIGATION_NOT_MET,
      ComplianceDisplayStatus.OBLIGATION_NOT_MET,
    );

    // Navigate back to the same obligation
    await summaries.openActionForOperation({
      operationName: ComplianceOperations.OBLIGATION_NOT_MET,
      linkName: GridActionText.MANAGE_OBLIGATION,
      urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
    });

    // Post-adjustment invoice assertions
    const postAdjVersionId = Number(
      new URL(page.url()).pathname.split("/").at(-2),
    );

    const postAdjPdfBuffer =
      await reviewObligationPOM.generateInvoiceAndGetPdfBuffer(
        postAdjVersionId,
        "obligation",
      );
    const postAdjInvoice =
      await ObligationInvoicePOM.fromBuffer(postAdjPdfBuffer);

    postAdjInvoice
      .assertHasInvoiceNumber()
      .assertHasFeesAndAdjustments()
      .assertHasAdjustmentLine()
      .assertOutstandingBalance(POST_ADJUSTMENT_OUTSTANDING_BALANCE_REGEX)
      .assertNotVoid();
  });
});
