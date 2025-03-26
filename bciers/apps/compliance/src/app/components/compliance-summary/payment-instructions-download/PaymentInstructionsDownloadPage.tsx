import {
  ActivePage,
  getComplianceSummaryTaskList,
} from "@/compliance/src/app/components/taskList/1_review2024ComplianceSummary";
import PaymentInstructionsDownloadComponent from "./PaymentInstructionsDownloadComponent";
import { getComplianceSummary } from "../../../utils/getComplianceSummary";

interface Props {
  compliance_summary_id: number;
}

export default async function PaymentInstructionsDownloadPage({
  compliance_summary_id,
}: Props) {
  const complianceSummary = await getComplianceSummary();

  const taskListElements = getComplianceSummaryTaskList(
    compliance_summary_id,
    complianceSummary.reporting_year,
    ActivePage.DownloadPaymentInstructions,
  );

  return (
    <PaymentInstructionsDownloadComponent taskListElements={taskListElements} />
  );
}
