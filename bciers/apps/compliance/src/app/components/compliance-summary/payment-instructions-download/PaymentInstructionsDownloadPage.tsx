import {
  ActivePage,
  getComplianceSummaryTaskList,
} from "@/compliance/src/app/components/taskList/1_review2024ComplianceSummary";
import PaymentInstructionsDownloadComponent from "./PaymentInstructionsDownloadComponent";
import { getComplianceSummary } from "../../../utils/getComplianceSummary";

interface Props {
  complianceSummaryId: number;
}

export default async function PaymentInstructionsDownloadPage({
  complianceSummaryId,
}: Props) {
  const complianceSummary = await getComplianceSummary();

  const taskListElements = getComplianceSummaryTaskList(
    complianceSummaryId,
    complianceSummary.reporting_year,
    ActivePage.DownloadPaymentInstructions,
  );

  return (
    <PaymentInstructionsDownloadComponent taskListElements={taskListElements} />
  );
}
