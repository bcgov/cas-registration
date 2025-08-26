import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import PaymentInstructionsDownloadComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/download-payment-instructions/PaymentInstructionsDownloadComponent";
import getInvoiceByComplianceReportVersionId from "@/compliance/src/app/utils/getInvoiceByComplianceReportVersionId";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";
import { ComplianceInvoiceTypes } from "@bciers/utils/src/enums";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import {
  ActivePage,
  generateManageObligationTaskList,
} from "../../../../taskLists/1_manageObligationTaskList";

export default async function PenaltyPaymentInstructionsDownloadPage({
  compliance_report_version_id: complianceReportVersionId,
}: HasComplianceReportVersion) {
  const customBackUrl = `/compliance-summaries/${complianceReportVersionId}/review-penalty-summary`;
  const customContinueUrl = `/compliance-summaries/${complianceReportVersionId}/pay-penalty-track-payments`;

  const {
    penalty_status: penaltyStatus,
    reporting_year: reportingYear,
    outstanding_balance: outstandingBalance,
  } = await getComplianceSummary(complianceReportVersionId);

  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    {
      penaltyStatus,
      reportingYear,
      outstandingBalance,
    },
    ActivePage.DownloadPaymentPenaltyInstruction,
  );

  const invoice = await getInvoiceByComplianceReportVersionId(
    complianceReportVersionId,
    ComplianceInvoiceTypes.AUTOMATIC_OVERDUE_PENALTY,
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceReportVersionId={complianceReportVersionId}
    >
      <PaymentInstructionsDownloadComponent
        complianceReportVersionId={complianceReportVersionId}
        invoiceID={invoice.invoice_number}
        customBackUrl={customBackUrl}
        customContinueUrl={customContinueUrl}
        invoiceType={ComplianceInvoiceTypes.AUTOMATIC_OVERDUE_PENALTY}
      />
    </CompliancePageLayout>
  );
}
