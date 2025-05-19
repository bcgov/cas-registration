import {
  ActivePage,
  getRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceSchema";
import { getRequestIssuanceTrackStatusData } from "../../../../utils/getRequestIssuanceTrackStatusData";
import TrackStatusOfIssuanceComponent from "./TrackStatusOfIssuanceComponent";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

interface Props {
  compliance_summary_id: string;
}

export default async function TrackStatusOfIssuancePage(props: Props) {
  const complianceSummaryId = parseInt(props.compliance_summary_id, 10);

  const complianceSummary = await getRequestIssuanceTrackStatusData(
    props.compliance_summary_id,
  );

  const taskListElements = getRequestIssuanceTaskList(
    complianceSummaryId,
    2024,
    ActivePage.TrackStatusOfIssuance,
  );

  return (
    <Suspense fallback={<Loading />}>
      <TrackStatusOfIssuanceComponent
        data={complianceSummary}
        complianceSummaryId={complianceSummaryId}
        taskListElements={taskListElements}
      />
    </Suspense>
  );
}
