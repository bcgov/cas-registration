import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import PaymentInstructionsDownloadComponent from "./PaymentInstructionsDownloadComponent";
import getInvoiceByComplianceSummaryId from "@/compliance/src/app/utils/getInvoiceByComplianceSummaryId";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function PaymentInstructionsDownloadPage({
  compliance_summary_id: complianceSummaryId,
}: Props) {
  const complianceSummary = {
    reportingYear: "2025",
  };

  const taskListElements = generateManageObligationTaskList(
    complianceSummaryId,
    complianceSummary.reportingYear,
    ActivePage.DownloadPaymentInstructions,
  );

  const invoice = await getInvoiceByComplianceSummaryId(complianceSummaryId);

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceSummaryId={complianceSummaryId}
    >
      <PaymentInstructionsDownloadComponent
        complianceSummaryId={complianceSummaryId}
        invoiceID={invoice.invoiceNumber}
      />
    </CompliancePageLayout>
  );
}
