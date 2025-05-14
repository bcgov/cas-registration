import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import CompliancePageLayout from "@bciers/components/layout/CompliancePageLayout";
import { TrackStatusOfIssuanceContent } from "./TrackStatusOfIssuanceContent";
import { RequestIssuanceTrackStatusData } from "@/compliance/src/app/utils/getRequestIssuanceTrackStatusData";

interface Props {
  data: RequestIssuanceTrackStatusData;
  complianceSummaryId: any;
  taskListElements: TaskListElement[];
}

export default function TrackStatusOfIssuanceComponent({
  data,
  complianceSummaryId,
  taskListElements,
}: Props) {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance/request-issuance-of-earned-credits`;

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      title={data.operation_name}
    >
      <TrackStatusOfIssuanceContent
        data={data}
        backUrl={backUrl}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
