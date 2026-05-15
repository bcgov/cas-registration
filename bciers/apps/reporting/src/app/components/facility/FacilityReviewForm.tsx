"use client";
import React, { useState } from "react";
import {
  ActivityData,
  buildFacilityReviewUiSchema,
} from "@reporting/src/data/jsonSchema/facilities";
import { actionHandler } from "@bciers/actions";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { RJSFSchema } from "@rjsf/utils";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { getUpdatedFacilityReportDetails } from "@reporting/src/app/utils/getUpdatedFacilityReportDetails";
import SnackBar from "@bciers/components/form/components/SnackBar";
import { handleApiResponse } from "@reporting/src/app/utils/handleApiResponse";
import { useFormErrors } from "@reporting/src/hooks/useFormErrors";
import { createGenericReportValidationError } from "@reporting/src/app/components/shared/validation/utils";

interface Props {
  version_id: number;
  operationId: string;
  facility_id: string;
  facilityActivities: ActivityData[];
  otherActivities: ActivityData[];
  navigationInformation: NavigationInformation;
  formsData: FacilityReviewFormData;
  schema: RJSFSchema;
  isSyncAllowed?: boolean;
}

export interface FacilityReviewFormData {
  operation_id: string;
  facility_name: string;
  facility_type: string;
  facility_bcghgid: string | null;
  facility_activities: string[];
  other_activities: string[];
  facility: string;
}

export const FacilityReview: React.FC<Props> = ({
  version_id,
  operationId,
  facility_id,
  facilityActivities,
  otherActivities,
  navigationInformation,
  formsData,
  schema,
  isSyncAllowed = true,
}) => {
  const [formData, setFormData] = useState<FacilityReviewFormData>(formsData);
  const { setErrors, renderedErrors } = useFormErrors();
  const uiSchema = buildFacilityReviewUiSchema(operationId, facility_id);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const handleSubmit = async () => {
    const method = "POST";
    const endpoint = `reporting/report-version/${version_id}/facility-report/${facility_id}`;
    const pathToRevalidate = `reporting/reports/${version_id}/facilities/${facility_id}/review-facility-information`;
    const selectedActivityNames = [
      ...(formData.facility_activities ?? []),
      ...(formData.other_activities ?? []),
    ];
    if (selectedActivityNames.length === 0) {
      setErrors([
        createGenericReportValidationError("You must select at least one activity."),]);
      return false;
    }

    const activityNameToIdMap = new Map<string, number>(
      [...facilityActivities, ...otherActivities].map(
        (activity: ActivityData) => [activity.name, activity.id],
      ),
    );
    const updatedFormData = {
      ...formData,
      activities: selectedActivityNames
        .map((activityName: string) => activityNameToIdMap.get(activityName))
        .filter((id): id is number => id !== undefined),
    };

    const response = await actionHandler(endpoint, method, pathToRevalidate, {
      body: JSON.stringify(updatedFormData),
    });

    return handleApiResponse(response, setErrors);
  };
  const handleSync = async () => {
    const getUpdatedFacilityData = await getUpdatedFacilityReportDetails(
      version_id,
      facility_id,
    );

    if (getUpdatedFacilityData.error) {
      setErrors([
        createGenericReportValidationError(getUpdatedFacilityData.error),
      ]);
      return;
    }

    setFormData((prevFormData: FacilityReviewFormData) => ({
      ...prevFormData,
      facility_name: getUpdatedFacilityData.facility_name,
      facility_type: getUpdatedFacilityData.facility_type,
      facility_bcghgid: getUpdatedFacilityData.facility_bcghgid,
    }));
    setErrors(undefined);
    setIsSnackbarOpen(true);
  };

  return (
    <>
      <MultiStepFormWithTaskList
        schema={schema}
        uiSchema={{
          ...uiSchema,
          ...(isSyncAllowed && {
            sync_button: {
              ...uiSchema.sync_button,
              "ui:options": {
                onSync: handleSync,
              },
            },
          }),
        }}
        formData={formData}
        onSubmit={handleSubmit}
        onChange={
          ((data: { formData: FacilityReviewFormData }) => {
            setFormData((prevFormData: FacilityReviewFormData) => ({
              ...prevFormData,
              ...data.formData,
            }));
          }) as (data: object) => void
        }
        continueUrl={navigationInformation.continueUrl}
        initialStep={navigationInformation.headerStepIndex}
        steps={navigationInformation.headerSteps}
        backUrl={navigationInformation.backUrl}
        saveButtonDisabled={false}
        taskListElements={navigationInformation.taskList}
        errors={renderedErrors}
      />
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message="Changes synced successfully"
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
    </>
  );
};

export default FacilityReview;
