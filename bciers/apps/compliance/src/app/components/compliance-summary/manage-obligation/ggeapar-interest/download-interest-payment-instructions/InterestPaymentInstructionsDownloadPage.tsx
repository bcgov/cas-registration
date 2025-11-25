import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import PaymentInstructionsDownloadComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/download-payment-instructions/PaymentInstructionsDownloadComponent";
import getInvoiceByComplianceReportVersionId from "@/compliance/src/app/utils/getInvoiceByComplianceReportVersionId";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";
import { ComplianceInvoiceTypes } from "@bciers/utils/src/enums";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

export default async function InterestPaymentInstructionsDownloadPage({
  compliance_report_version_id: complianceReportVersionId,
}: HasComplianceReportVersion) {
  const customBackUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-interest-summary`;
  const customContinueUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/pay-interest-penalty-track-payments`;

  const {
    penalty_status: penaltyStatus,
    reporting_year: reportingYear,
    outstanding_balance_tco2e: outstandingBalance,
    has_late_submission_penalty: hasLateSubmissionPenalty,
  } = await getComplianceSummary(complianceReportVersionId);

  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    {
      penaltyStatus,
      reportingYear,
      outstandingBalance,
      hasLateSubmissionPenalty,
    },
    ActivePage.DownloadInterestPaymentInstructions,
  );

  const invoice = await getInvoiceByComplianceReportVersionId(
    complianceReportVersionId,
    ComplianceInvoiceTypes.LATE_SUBMISSION_PENALTY,
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
        invoiceType={ComplianceInvoiceTypes.LATE_SUBMISSION_PENALTY}
      />
    </CompliancePageLayout>
  );
}
