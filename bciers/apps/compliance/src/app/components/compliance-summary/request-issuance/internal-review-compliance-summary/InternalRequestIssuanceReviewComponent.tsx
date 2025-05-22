import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import CompliancePageLayout from "@bciers/components/layout/CompliancePageLayout";
import { InternalRequestIssuanceReviewContent } from "./InternalRequestIssuanceReviewContent";

interface Props {
  readonly formData: any;
  readonly complianceSummaryId: any;
  readonly taskListElements: TaskListElement[];
}

export function InternalRequestIssuanceReviewComponent({
  formData,
  complianceSummaryId,
  taskListElements,
}: Props) {
  const backUrl = `/idir/cas_analyst/compliance-summaries`;
  const saveAndContinueUrl = `/idir/cas_analyst/compliance-summaries/${complianceSummaryId}/track-status-of-issuance`;

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      title={formData.operation_name}
    >
      <InternalRequestIssuanceReviewContent
        data={formData}
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
      />
    </CompliancePageLayout>
  );
}
