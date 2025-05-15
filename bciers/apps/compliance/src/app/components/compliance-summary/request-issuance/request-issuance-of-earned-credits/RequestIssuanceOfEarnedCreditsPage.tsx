import {
  ActivePage,
  getRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceSchema";
import { getRequestIssuanceData } from "@/compliance/src/app/utils/getRequestIssuanceData";
import RequestIssuanceOfEarnedCreditsComponent from "./RequestIssuanceOfEarnedCreditsComponent";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function RequestIssuanceOfEarnedCreditsPage({
  compliance_summary_id,
}: Props) {
  const complianceSummaryId = parseInt(compliance_summary_id, 10);

  const data = await getRequestIssuanceData();

  const taskListElements = getRequestIssuanceTaskList(
    complianceSummaryId,
    2024,
    ActivePage.RequestIssuanceOfEarnedCredits,
  );

  return (
    <Suspense fallback={<Loading />}>
      <RequestIssuanceOfEarnedCreditsComponent
        data={data}
        complianceSummaryId={complianceSummaryId}
        taskListElements={taskListElements}
      />
    </Suspense>
  );
}
