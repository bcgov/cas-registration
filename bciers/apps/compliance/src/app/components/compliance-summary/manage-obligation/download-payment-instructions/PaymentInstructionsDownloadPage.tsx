import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import PaymentInstructionsDownloadComponent from "./PaymentInstructionsDownloadComponent";
import getInvoiceByComplianceReportVersionId from "@/compliance/src/app/utils/getInvoiceByComplianceReportVersionId";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function PaymentInstructionsDownloadPage({
  compliance_summary_id: complianceSummaryId,
}: Props) {
  const reportingYearData = await getReportingYear();
  const taskListElements = generateManageObligationTaskList(
    complianceSummaryId,
    reportingYearData,
    ActivePage.DownloadPaymentObligationInstructions,
  );

  const invoice =
    await getInvoiceByComplianceReportVersionId(complianceSummaryId);

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceSummaryId={complianceSummaryId}
    >
      <PaymentInstructionsDownloadComponent
        complianceReportVersionId={complianceSummaryId}
        invoiceID={invoice.invoice_number}
      />
    </CompliancePageLayout>
  );
}
