"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { RJSFSchema } from "@rjsf/utils";
import { operationReviewUiSchema } from "@reporting/src/data/jsonSchema/operations";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";
import { NavigationInformation } from "../taskList/types";

interface Props {
  formData: any;
  version_id: number;
  schema: RJSFSchema;
  navigationInformation: NavigationInformation;
}

export default function OperationReviewForm({
  formData,
  version_id,
  schema,
  navigationInformation,
}: Props) {
  const [pendingChangeReportType, setPendingChangeReportType] =
    useState<string>();
  const [formDataState, setFormDataState] = useState<any>(formData);
  const [errors, setErrors] = useState<string[]>();
  const [apiError, setApiError] = useState<string | null>(null);

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
    } else {
      setApiError("Failed to change the report type. Please try again.");
    }
  };

  const cancelReportTypeChange = () => {
    setFormDataState(formData);
    setApiError(null);
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
        {apiError ? (
          <div style={{ color: "red" }}>{apiError}</div>
        ) : (
          <>
            Are you sure you want to change your report type to{" "}
            <strong>{pendingChangeReportType}</strong>? If you proceed, all of
            the form data you have entered will be lost.
          </>
        )}
      </SimpleModal>
      <MultiStepFormWithTaskList
        initialStep={navigationInformation.headerStepIndex}
        steps={navigationInformation.headerSteps}
        taskListElements={navigationInformation.taskList}
        schema={schema}
        uiSchema={operationReviewUiSchema}
        formData={formDataState}
        onSubmit={saveHandler}
        onChange={onChangeHandler}
        backUrl={navigationInformation.backUrl}
        continueUrl={navigationInformation.continueUrl}
        errors={errors}
      />
    </>
  );
}
