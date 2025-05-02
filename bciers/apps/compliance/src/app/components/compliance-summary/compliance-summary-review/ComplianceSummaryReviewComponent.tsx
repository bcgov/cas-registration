"use client";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import CompliancePageLayout from "@bciers/components/layout/CompliancePageLayout";
import { ComplianceSummaryReviewContent } from "./ComplianceSummaryReviewContent";
import { PaymentsData } from "@/compliance/src/app/types/payments";

interface Props {
  formData: any;
  complianceSummaryId: number;
  taskListElements: TaskListElement[];
  paymentsData?: PaymentsData;
}

export default function ComplianceSummaryReviewComponent({
  formData,
  complianceSummaryId,
  taskListElements,
  paymentsData,
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
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/download-payment-instructions`;

  return (
    <>
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
    </>
  );
}
