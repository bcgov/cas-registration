import {
  ActivePage,
  generateRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceTaskList";
import { getRequestIssuanceTrackStatusData } from "../../../../utils/getRequestIssuanceTrackStatusData";
import CompliancePageLayout from "../../../layout/CompliancePageLayout";
import TrackStatusOfIssuanceContent from "./TrackStatusOfIssuanceComponent";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function TrackStatusOfIssuancePage(props: Props) {
  const complianceSummaryId = parseInt(props.compliance_summary_id, 10);

  const data = await getRequestIssuanceTrackStatusData();
  // props.compliance_summary_id,

  const taskListElements = generateRequestIssuanceTaskList(
    complianceSummaryId.toString(),
    2024,
    ActivePage.TrackStatusOfIssuance,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={props.compliance_summary_id}
      taskListElements={taskListElements}
    >
      <TrackStatusOfIssuanceContent
        data={data}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
