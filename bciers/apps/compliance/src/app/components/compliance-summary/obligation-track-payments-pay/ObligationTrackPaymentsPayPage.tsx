import {
  ActivePage,
  getComplianceSummaryTaskList,
} from "@/compliance/src/app/components/taskList/1_review2024ComplianceSummary";
import ObligationTrackPaymentsPayComponent from "./ObligationTrackPaymentsPayComponent";
import { getComplianceSummary } from "../../../utils/getComplianceSummary";

interface Props {
  complianceSummaryId: number;
}

export default async function ObligationTrackPaymentsPayPage({
  complianceSummaryId,
}: Props) {
  const complianceSummary = await getComplianceSummary();

  const taskListElements = getComplianceSummaryTaskList(
    complianceSummaryId,
    complianceSummary.reporting_year,
    ActivePage.PayObligationTrackPayments,
  );

  return (
    <ObligationTrackPaymentsPayComponent taskListElements={taskListElements} />
  );
}
