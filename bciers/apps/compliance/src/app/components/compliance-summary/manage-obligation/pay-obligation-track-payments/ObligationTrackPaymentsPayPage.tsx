import {
  ActivePage,
  getComplianceSummaryTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationSchema";
import ObligationTrackPaymentsPayComponent from "./ObligationTrackPaymentsPayComponent";
import { getComplianceSummary } from "../../../../utils/getComplianceSummary";

interface Props {
  readonly compliance_summary_id: number;
}

export default async function ObligationTrackPaymentsPayPage(props: Props) {
  const complianceSummaryId = props.compliance_summary_id;
  const complianceSummary = await getComplianceSummary(complianceSummaryId);

  const taskListElements = getComplianceSummaryTaskList(
    complianceSummaryId,
    complianceSummary.reporting_year,
    ActivePage.PayObligationTrackPayments,
  );

  return (
    <ObligationTrackPaymentsPayComponent taskListElements={taskListElements} />
  );
}
