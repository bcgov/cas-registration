import {
  ActivePage,
  getComplianceSummaryTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationSchema";
import PaymentInstructionsDownloadComponent from "./PaymentInstructionsDownloadComponent";
import { getComplianceSummary } from "../../../../utils/getComplianceSummary";

interface Props {
  compliance_summary_id: number;
}

export default async function PaymentInstructionsDownloadPage(props: Props) {
  const complianceSummaryId = props.compliance_summary_id;

  const complianceSummary = await getComplianceSummary(complianceSummaryId);

  const taskListElements = getComplianceSummaryTaskList(
    complianceSummaryId,
    complianceSummary.reporting_year,
    ActivePage.DownloadPaymentInstructions,
  );

  return (
    <PaymentInstructionsDownloadComponent taskListElements={taskListElements} />
  );
}
