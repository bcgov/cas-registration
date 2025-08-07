import {
  ActivePage,
  generateAutomaticOverduePenaltyTaskList,
} from "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import PaymentInstructionsDownloadComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/download-payment-instructions/PaymentInstructionsDownloadComponent";
import getInvoiceByComplianceReportVersionId from "@/compliance/src/app/utils/getInvoiceByComplianceReportVersionId";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";

export default async function PenaltyPaymentInstructionsDownloadPage({
  compliance_report_version_id: complianceReportVersionId,
}: HasComplianceReportVersion) {
  const customBackUrl = `/compliance-summaries/${complianceReportVersionId}/review-penalty-summary`;
  const customContinueUrl = `/compliance-summaries/${complianceReportVersionId}/pay-penalty-track-payments`;

  const reportingYearData = await getReportingYear();

  const taskListElements = generateAutomaticOverduePenaltyTaskList(
    complianceReportVersionId,
    reportingYearData.reporting_year,
    ActivePage.DownloadPaymentPenaltyInstruction,
  );

  const invoice = await getInvoiceByComplianceReportVersionId(
    complianceReportVersionId,
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
      />
    </CompliancePageLayout>
  );
}
