import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { RequestIssuanceOfEarnedCreditsContent } from "./RequestIssuanceOfEarnedCreditsContent";
import { RequestIssuanceData } from "@/compliance/src/app/utils/getRequestIssuanceData";

interface Props {
  readonly data: RequestIssuanceData;
  readonly complianceSummaryId: any;
  readonly taskListElements: TaskListElement[];
}

export default function RequestIssuanceOfEarnedCreditsComponent({
  data,
  complianceSummaryId,
  taskListElements,
}: Props) {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance/review-compliance-summary`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance/track-status-of-issuance`;

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      title={data.operation_name}
    >
      <RequestIssuanceOfEarnedCreditsContent
        data={data}
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
      />
    </CompliancePageLayout>
  );
}
