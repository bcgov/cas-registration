"use client";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import CompliancePageLayout from "@bciers/components/layout/CompliancePageLayout";
import { ComplianceSummaryReviewContent } from "./ComplianceSummaryReviewContent";

interface Props {
  readonly formData: any;
  readonly complianceSummaryId: any;
  readonly taskListElements: TaskListElement[];
}

export default function ComplianceSummaryReviewComponent({
  formData,
  complianceSummaryId,
  taskListElements,
}: Props) {
  // Uncomment after Review Compliance Summary will be completed

  // const saveHandler = async () => {
  //   console.log("save");
  //   return true;
  // };

  // const onChangeHandler = () => {
  //   console.log("change");
  // };

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
      />
    </CompliancePageLayout>
  );
}
