import {
  ActivePage,
  getRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceSchema";
import { getRequestIssuanceData } from "../../../../utils/getRequestIssuanceData";
import RequestIssuanceOfEarnedCreditsComponent from "./RequestIssuanceOfEarnedCreditsComponent";

interface Props {
  compliance_summary_id: string;
}

export default async function RequestIssuanceOfEarnedCreditsPage({
  compliance_summary_id,
}: Props) {
  const complianceSummaryId = parseInt(compliance_summary_id, 10);

  const data = await getRequestIssuanceData(compliance_summary_id);

  const taskListElements = getRequestIssuanceTaskList(
    complianceSummaryId,
    2024,
    ActivePage.RequestIssuanceOfEarnedCredits,
  );

  return (
    <RequestIssuanceOfEarnedCreditsComponent
      data={data}
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    />
  );
}
