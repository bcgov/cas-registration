import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import CompliancePageLayout from "@bciers/components/layout/CompliancePageLayout";
import { RequestIssuanceOfEarnedCreditsContent } from "./RequestIssuanceOfEarnedCreditsContent";
import { RequestIssuanceData } from "../../../../utils/getRequestIssuanceData";

interface Props {
  data: RequestIssuanceData;
  complianceSummaryId: any;
  taskListElements: TaskListElement[];
}

export default function RequestIssuanceOfEarnedCreditsComponent({
  data,
  complianceSummaryId,
  taskListElements,
}: Props) {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance/review-compliance-summary`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance/track-status-of-issuance`;

  return (
    <>
      <CompliancePageLayout
        taskListElements={taskListElements}
        title={data.operation_name}
      >
        <RequestIssuanceOfEarnedCreditsContent
          data={data}
          backUrl={backUrl}
          continueUrl={saveAndContinueUrl}
          complianceSummaryId={complianceSummaryId}
        />
      </CompliancePageLayout>
    </>
  );
}
