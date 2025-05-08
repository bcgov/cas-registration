import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import CompliancePageLayout from "@bciers/components/layout/CompliancePageLayout";
import { ComplianceSummaryReviewContent } from "./ComplianceSummaryReviewContent";
import { PaymentsData } from "@/compliance/src/app/types/payments";

interface Props {
  readonly formData: any;
  readonly complianceSummaryId: any;
  readonly taskListElements: TaskListElement[];
  readonly paymentsData: PaymentsData;
}

export default function ComplianceSummaryReviewComponent({
  formData,
  complianceSummaryId,
  taskListElements,
  paymentsData,
}: Props) {
  const backUrl = `/compliance-summaries`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/manage-obligation/download-payment-instructions`;

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      title={formData.operation_name}
    >
      <ComplianceSummaryReviewContent
        data={formData}
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
        complianceSummaryId={complianceSummaryId}
        paymentsData={paymentsData}
      />
    </CompliancePageLayout>
  );
}
