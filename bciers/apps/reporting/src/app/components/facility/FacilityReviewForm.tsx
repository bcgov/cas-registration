"use client";
import React, { useState } from "react";
import {
  ActivityData,
  facilityReviewUiSchema,
} from "@reporting/src/data/jsonSchema/facilities";
import { actionHandler } from "@bciers/actions";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { RJSFSchema } from "@rjsf/utils";
import { NavigationInformation } from "../taskList/types";
import { getUpdatedFacilityReportDetails } from "@reporting/src/app/utils/getUpdatedFacilityReportDetails";

interface Props {
  version_id: number;
  facility_id: string;
  activitiesData: ActivityData[];
  navigationInformation: NavigationInformation;
  formsData: object;
  schema: RJSFSchema;
}

interface Activity {
  name: string;
  id: number;
}

const FacilityReview: React.FC<Props> = ({
  version_id,
  facility_id,
  activitiesData,
  navigationInformation,
  formsData,
  schema,
}) => {
  const [formData, setFormData] = useState<any>(formsData);
  const [errors, setErrors] = useState<string[] | undefined>();
  const handleSubmit = async () => {
    const method = "POST";
    const endpoint = `reporting/report-version/${version_id}/facility-report/${facility_id}`;

    const activityNameToIdMap = new Map(
      activitiesData.map((activity: Activity) => [activity.name, activity.id]),
    );

    const updatedFormData = {
      ...formData,
      activities: formData.activities
        .map((activityName: string) => {
          return activityNameToIdMap.get(activityName); // No console.error() here, just return the ID (or undefined)
        })
        .filter((id: number | undefined) => id !== undefined) // Filter out undefined IDs
        .map(String), // Ensure all IDs are strings
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
    const updatedFacilityData = await getUpdatedFacilityReportDetails(
      version_id,
      facility_id,
    );
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      facility_name: updatedFacilityData.facility_name,
      facility_type: updatedFacilityData.facility_type,
      facility_bcghgid: updatedFacilityData.facility_bcghgid,
    }));
  };

  return (
    <MultiStepFormWithTaskList
      schema={schema}
      uiSchema={{
        ...facilityReviewUiSchema,
        sync_button: {
          ...facilityReviewUiSchema.sync_button,
          "ui:options": {
            onSync: handleSync,
          },
        },
      }}
      formData={formData}
      onSubmit={handleSubmit}
      onChange={(data: any) => {
        setFormData((prevFormData: any) => ({
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
  );
};

export default FacilityReview;
