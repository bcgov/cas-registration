import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import PaymentInstructionsDownloadComponent from "./PaymentInstructionsDownloadComponent";
import getInvoiceByComplianceReportVersionId from "@/compliance/src/app/utils/getInvoiceByComplianceReportVersionId";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";

export default async function PaymentInstructionsDownloadPage({
  compliance_report_version_id: complianceReportVersionId,
}: HasComplianceReportVersion) {
  const {
    penalty_status: penaltyStatus,
    reporting_year: reportingYear,
    outstanding_balance_tco2e: outstandingBalance,
  } = await getComplianceSummary(complianceReportVersionId);
  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    {
      penaltyStatus,
      reportingYear,
      outstandingBalance,
    },
    ActivePage.DownloadPaymentObligationInstructions,
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
      />
    </CompliancePageLayout>
  );
}
