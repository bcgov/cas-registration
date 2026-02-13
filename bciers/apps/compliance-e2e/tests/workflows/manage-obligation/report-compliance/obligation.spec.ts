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

import { ComplianceSetupPOM } from "@/compliance-e2e/poms/compliance-setup";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";

// 👤 run test using the storageState for role UserRole.INDUSTRY_USER_ADMIN
const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });

test.describe("Test compliance report version manage obligation flow", () => {
  test("when invoice_generation_date is reached, compliance report version status is OBLIGATION_NOT_MET", async ({
    page,
    request,
    happoScreenshot,
  }) => {
    // ------------------------------------------------------------------
    // PRECONDITIONS:
    // Prime invoice_generation_date DB state so integration is allowed
    // ------------------------------------------------------------------
    const complianceSetupPOM = new ComplianceSetupPOM(page);
    await complianceSetupPOM.primeInvoiceGenerationGate("open");

    // ------------------------------------------------------------------
    // Submit obligation report
    // ------------------------------------------------------------------
    const reports = new CurrentReportsPOM(page);
    await reports.submitReportObligation(false, request);

    // ------------------------------------------------------------------
    // Navigate to the compliance summaries grid
    // ------------------------------------------------------------------
    const summaries = new ComplianceSummariesPOM(page);
    await summaries.route();

    // ------------------------------------------------------------------
    // Assert the gate open for invoice integration
    // ------------------------------------------------------------------
    await summaries.assertStatusForOperation(
      ComplianceOperations.OBLIGATION_NOT_MET,
      ComplianceDisplayStatus.OBLIGATION_NOT_MET,
    );

    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Compliance obligation not met",
      variant: "status: Obligation - not met",
    });

    // ------------------------------------------------------------------
    // Assert the record has an invoice number related to this obligation
    // ------------------------------------------------------------------
    await summaries.openActionForOperation({
      operationName: ComplianceOperations.OBLIGATION_NOT_MET,
      linkName: GridActionText.MANAGE_OBLIGATION,
      urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
    });

    const manageObligationTaskList = new ManageObligationTaskListPOM(page);
    await manageObligationTaskList.clickDownloadPaymentInstructions();

    const paymentInstructions = new PaymentInstructionsPOM(page);
    await paymentInstructions.assertHasInvoiceNumber();

    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Compliance obligation not met",
      variant: "payment instructions invoice number",
    });
  });

  test("when invoice_generation_date is NOT reached, compliance report version status is PENDING_INVOICE_CREATION", async ({
    page,
    request,
    happoScreenshot,
  }) => {
    // ------------------------------------------------------------------
    // PRECONDITIONS:
    // Prime invoice_generation_date DB state so integration is blocked
    // ------------------------------------------------------------------
    const complianceSetupPOM = new ComplianceSetupPOM(page);
    await complianceSetupPOM.primeInvoiceGenerationGate("closed");

    // ------------------------------------------------------------------
    // Submit obligation report
    // ------------------------------------------------------------------
    const reports = new CurrentReportsPOM(page);
    await reports.submitReportObligation(false, request);

    // ------------------------------------------------------------------
    // Navigate to the compliance summaries grid
    // ------------------------------------------------------------------
    const summaries = new ComplianceSummariesPOM(page);
    await summaries.route();

    // ------------------------------------------------------------------
    // Assert the gate blocked invoice integration
    // ------------------------------------------------------------------
    await summaries.assertStatusForOperation(
      ComplianceOperations.OBLIGATION_NOT_MET,
      ComplianceDisplayStatus.PENDING_INVOICE_CREATION,
    );

    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Compliance obligation not met",
      variant: "status: Obligation - pending invoice creation",
    });
  });
});
