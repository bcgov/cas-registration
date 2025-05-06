"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { RJSFSchema } from "@rjsf/utils";
import {
  buildOperationReviewSchema,
  buildOperationReviewUiSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";
import {
  HeaderStep,
  NavigationInformation,
  ReportingPage,
} from "../taskList/types";
import { getUpdatedReportOperationDetails } from "@reporting/src/app/utils/getUpdatedReportOperationDetails";
import { SyncFacilitiesButton } from "@reporting/src/data/jsonSchema/reviewFacilities/reviewFacilitiesInfoText";
import SnackBar from "@bciers/components/form/components/SnackBar";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  showActivities,
  showBoroId,
  showRegulatedProducts,
} from "@reporting/src/app/components/operations/getOperationSchemaParameters";

interface Props {
  formData: any;
  version_id: number;
  schema: RJSFSchema;
  navigationInformation: NavigationInformation;
  reportType: string;
  reportingWindowEnd: string;
  allActivities: any[];
  allRegulatedProducts: any[];
  facilityId: string;
}
export default function OperationReviewForm({
  formData,
  version_id,
  schema,
  navigationInformation,
  reportType,
  reportingWindowEnd,
  allActivities,
  allRegulatedProducts,
  facilityId,
}: Props) {
  const [pendingChangeReportType, setPendingChangeReportType] =
    useState<string>();
  const [formDataState, setFormDataState] = useState<any>(formData);
  const [pageSchema, setPageSchema] = useState(schema);
  const [errors, setErrors] = useState<string[]>();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [navigationInfo, setNavigationInfo] = useState(navigationInformation);

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

  const handleSync = async () => {
    const newData = await getUpdatedReportOperationDetails(version_id);
    if (newData.error) {
      setErrors(["Unable to sync data"]);
      return;
    }

    setPageSchema(
      buildOperationReviewSchema(
        newData,
        reportingWindowEnd,
        allActivities,
        allRegulatedProducts,
        newData.report_operation_representatives,
        reportType,
        showRegulatedProducts(newData.registration_purpose),
        showBoroId(newData.registration_purpose),
        showActivities(newData.registration_purpose),
      ),
    );
    setNavigationInfo(
      await getNavigationInformation(
        HeaderStep.OperationInformation,
        ReportingPage.ReviewOperationInfo,
        version_id,
        facilityId,
      ),
    );
    setFormDataState(newData);
    setErrors(undefined);
    setIsSnackbarOpen(true);
  };
  const uiSchema = buildOperationReviewUiSchema(
    formData.operation_id,
    formData.operation_name,
  );

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
        initialStep={navigationInfo.headerStepIndex}
        steps={navigationInfo.headerSteps}
        taskListElements={navigationInfo.taskList}
        schema={pageSchema}
        uiSchema={{
          ...uiSchema,
          sync_button: {
            ...uiSchema.sync_button,
            "ui:FieldTemplate": SyncFacilitiesButton,
            "ui:options": {
              onSync: handleSync,
            },
          },
        }}
        formData={formDataState}
        onSubmit={saveHandler}
        onChange={onChangeHandler}
        backUrl={navigationInfo.backUrl}
        continueUrl={navigationInfo.continueUrl}
        errors={errors}
      />
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message="Changes synced successfully"
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
    </>
  );
}
