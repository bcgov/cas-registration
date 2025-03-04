"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { RJSFSchema } from "@rjsf/utils";
import { operationReviewUiSchema } from "@reporting/src/data/jsonSchema/operations";
import { actionHandler } from "@bciers/actions";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { useRouter } from "next/navigation";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

interface Props {
  formData: any;
  version_id: number;
  schema: RJSFSchema;
  taskListElements: TaskListElement[];
}

export default function OperationReviewForm({
  formData,
  version_id,
  schema,
  taskListElements,
}: Props) {
  const [pendingChangeReportType, setPendingChangeReportType] =
    useState<string>();
  const [formDataState, setFormDataState] = useState<any>(formData);
  const [errors, setErrors] = useState<string[]>();

  // 🛸 Set up routing urls
  const backUrl = `/reports`;
  const saveAndContinueUrl = `/reports/${version_id}/person-responsible`;

  const router = useRouter();

  const saveHandler = async () => {
    const method = "POST";
    const endpoint = `reporting/report-version/${version_id}/report-operation`;
    const response = await actionHandler(endpoint, method, "", {
      body: JSON.stringify(formDataState),
    });

    if (response?.error) {
      setErrors([response?.error]);
      return false;
    }

    setErrors(undefined);
    return true;
  };

  const onChangeHandler = (data: { formData: any }) => {
    const updatedFormData = data.formData;

    if (
      formDataState.operation_report_type !== undefined &&
      formDataState.operation_report_type !==
        updatedFormData.operation_report_type
    ) {
      setPendingChangeReportType(updatedFormData.operation_report_type);
      updatedFormData.operation_report_type =
        formDataState.operation_report_type;
    }

    setFormDataState(updatedFormData);
  };

  const confirmReportTypeChange = async () => {
    const method = "POST";
    const endpoint = `reporting/report-version/${version_id}/change-report-type`;
    const response = await actionHandler(endpoint, method, "", {
      body: JSON.stringify({ report_type: pendingChangeReportType }),
    });

    if (response && !response.error) {
      router.push(`/reports/${response}/review-operation-information`);
    }
  };
  const cancelReportTypeChange = () => {
    setFormDataState((prevState: any) => ({ ...prevState }));
    setPendingChangeReportType(undefined);
  };

  return (
    <>
      <SimpleModal
        title="Confirmation"
        open={pendingChangeReportType !== undefined}
        onCancel={cancelReportTypeChange}
        onConfirm={confirmReportTypeChange}
        confirmText="Change report type"
      >
        Are you sure you want to change your report type to{" "}
        <strong>{pendingChangeReportType}</strong>? If you proceed, all of the
        form data you have entered will be lost.
      </SimpleModal>
      <MultiStepFormWithTaskList
        initialStep={0}
        steps={multiStepHeaderSteps}
        taskListElements={taskListElements}
        schema={schema}
        uiSchema={operationReviewUiSchema}
        formData={formDataState}
        onSubmit={saveHandler}
        onChange={onChangeHandler}
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
        errors={errors}
      />
    </>
  );
}
