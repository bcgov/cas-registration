import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import CompliancePageLayout from "@bciers/components/layout/CompliancePageLayout";
import { RequestIssuanceReviewContent } from "./RequestIssuanceReviewContent";

interface Props {
  formData: any;
  complianceSummaryId: any;
  taskListElements: TaskListElement[];
}

export default function RequestIssuanceReviewComponent({
  formData,
  complianceSummaryId,
  taskListElements,
}: Props) {
  const backUrl = `/compliance-summaries`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance/request-issuance-of-earned-credits`;

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      title={formData.operation_name}
    >
      <RequestIssuanceReviewContent
        data={formData}
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
