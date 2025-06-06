"use client";
import React, { useState } from "react";
import {
  ActivityData,
  buildFacilityReviewUiSchema,
} from "@reporting/src/data/jsonSchema/facilities";
import { actionHandler } from "@bciers/actions";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { RJSFSchema } from "@rjsf/utils";
import { NavigationInformation } from "../taskList/types";
import { getUpdatedFacilityReportDetails } from "@reporting/src/app/utils/getUpdatedFacilityReportDetails";
import SnackBar from "@bciers/components/form/components/SnackBar";

interface Props {
  version_id: number;
  operationId: string;
  facility_id: string;
  activitiesData: ActivityData[];
  navigationInformation: NavigationInformation;
  formsData: FacilityReviewFormData;
  schema: RJSFSchema;
}

export interface FacilityReviewFormData {
  operation_id: string;
  facility_name: string;
  facility_type: string;
  facility_bcghgid: string | null;
  activities: string[];
  facility: string;
}

export const FacilityReview: React.FC<Props> = ({
  version_id,
  operationId,
  facility_id,
  activitiesData,
  navigationInformation,
  formsData,
  schema,
}) => {
  const [formData, setFormData] = useState<FacilityReviewFormData>(formsData);
  const [errors, setErrors] = useState<string[] | undefined>();
  const uiSchema = buildFacilityReviewUiSchema(operationId, facility_id);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const handleSubmit = async () => {
    const method = "POST";
    const endpoint = `reporting/report-version/${version_id}/facility-report/${facility_id}`;

    if (formData.activities.length === 0) {
      setErrors(["You must select at least one activity"]);
      return false;
    }

    const activityNameToIdMap = new Map(
      activitiesData.map((activity: ActivityData) => [
        activity.name,
        activity.id,
      ]),
    );
    const updatedFormData = {
      ...formData,
      activities: formData.activities
        .map((activityName: string) => {
          return activityNameToIdMap.get(activityName);
        })
        .filter((id: number | undefined) => id !== undefined) // Filter out undefined IDs
        .map(Number), // Ensure all IDs are numbers
    };

    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(updatedFormData),
    });
    if (response?.error) {
      setErrors([response.error]);
      return false;
    }

    setErrors(undefined);
    return true;
  };
  const handleSync = async () => {
    const getUpdatedFacilityData = await getUpdatedFacilityReportDetails(
      version_id,
      facility_id,
    );

    if (getUpdatedFacilityData.error) {
      setErrors(["Unable to sync data"]);
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
          sync_button: {
            ...uiSchema.sync_button,
            "ui:options": {
              onSync: handleSync,
            },
          },
        }}
        formData={formData}
        onSubmit={handleSubmit}
        onChange={(data: { formData: FacilityReviewFormData }) => {
          setFormData((prevFormData: FacilityReviewFormData) => ({
            ...prevFormData,
            ...data.formData,
          }));
        }}
        continueUrl={navigationInformation.continueUrl}
        initialStep={navigationInformation.headerStepIndex}
        steps={navigationInformation.headerSteps}
        backUrl={navigationInformation.backUrl}
        saveButtonDisabled={false}
        taskListElements={navigationInformation.taskList}
        errors={errors}
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
