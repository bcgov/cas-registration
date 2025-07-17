import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import PaymentInstructionsDownloadComponent from "./PaymentInstructionsDownloadComponent";
import getInvoiceByComplianceReportVersionId from "@/compliance/src/app/utils/getInvoiceByComplianceReportVersionId";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";

export default async function PaymentInstructionsDownloadPage({
  compliance_report_version_id: complianceReportVersionId,
}: HasComplianceReportVersion) {
  const reportingYearData = await getReportingYear();
  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    reportingYearData,
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
