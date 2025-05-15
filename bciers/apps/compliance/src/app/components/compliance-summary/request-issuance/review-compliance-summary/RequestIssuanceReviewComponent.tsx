import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { RequestIssuanceReviewContent } from "./RequestIssuanceReviewContent";

interface Props {
  readonly formData: any;
  readonly complianceSummaryId: any;
  readonly taskListElements: TaskListElement[];
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
      />
    </CompliancePageLayout>
  );
}
