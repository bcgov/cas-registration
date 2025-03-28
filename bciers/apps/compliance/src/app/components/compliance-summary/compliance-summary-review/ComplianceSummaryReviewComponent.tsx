"use client";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import CompliancePageLayout from "@bciers/components/layout/CompliancePageLayout";

interface Props {
  formData: any;
  compliance_summary_id: any;
  taskListElements: TaskListElement[];
}

export default function ComplianceSummaryReviewComponent({
  formData,
  compliance_summary_id,
  taskListElements,
}: Props) {
  // const [errors, setErrors] = useState<string[]>();

  const saveHandler = async () => {
    console.log("save");
    return true;
  };

  const onChangeHandler = () => {
    console.log("change");
  };

  // 🛸 Set up routing urls
  const backUrl = `/compliance-summaries`;
  const saveAndContinueUrl = `/compliance-summaries/${compliance_summary_id}/download-payment-instructions`;

  return (
    <>
      <CompliancePageLayout
        formData={formData}
        initialStep={0}
        steps={["Review Compliance Summary"]}
        taskListElements={taskListElements}
        onChange={onChangeHandler}
        onSubmit={saveHandler}
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
        // errors={errors}
        title={formData.operation_name}
        noSaveButton={true}
        hideTaskList={true}
      />
    </>
  );
}
