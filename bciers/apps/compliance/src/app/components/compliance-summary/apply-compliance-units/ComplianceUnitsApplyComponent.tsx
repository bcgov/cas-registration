"use client";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import CompliancePageLayout from "@bciers/components/layout/CompliancePageLayout";
import { ComplianceUnitsApplyContent } from "./ComplianceUnitsApplyContent";

interface Props {
  formData: any;
  complianceSummaryId: any;
  taskListElements: TaskListElement[];
}

export default function ComplianceUnitsApplyComponent({
  formData,
  complianceSummaryId,
  taskListElements,
}: Props) {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/review-compliance-summary`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/download-payment-instructions`;

  return (
    <>
      <CompliancePageLayout
        taskListElements={taskListElements}
        title={formData.operation_name}
      >
        <ComplianceUnitsApplyContent
          data={formData}
          backUrl={backUrl}
          continueUrl={saveAndContinueUrl}
          complianceSummaryId={complianceSummaryId}
        />
      </CompliancePageLayout>
    </>
  );
}
