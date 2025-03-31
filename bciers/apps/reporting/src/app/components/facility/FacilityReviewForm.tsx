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

interface Props {
  version_id: number;
  operationId: string;
  facility_id: string;
  activitiesData: ActivityData[];
  navigationInformation: NavigationInformation;
  formsData: object;
  schema: RJSFSchema;
}

interface UpdatedFacilityData {
  facility_name: string;
  facility_type: string;
  facility_bcghgid: string;
}

const FacilityReview: React.FC<Props> = ({
  version_id,
  operationId,
  facility_id,
  activitiesData,
  navigationInformation,
  formsData,
  schema,
}) => {
  const [formData, setFormData] = useState<object>(formsData);
  const [errors, setErrors] = useState<string[] | undefined>();
  const uiSchema = buildFacilityReviewUiSchema(operationId, facility_id);
  const handleSubmit = async () => {
    const method = "POST";
    const endpoint = `reporting/report-version/${version_id}/facility-report/${facility_id}`;

    const activityNameToIdMap = new Map(
      activitiesData.map((activity: ActivityData) => [
        activity.name,
        activity.id,
      ]),
    );
    const updatedFormData = {
      ...formData,
      activities: (formData as any).activities
        .map((activityName: string) => {
          return activityNameToIdMap.get(activityName);
        })
        .filter((id: number | undefined) => id !== undefined)
        .map(String),
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
    const updatedFacilityData: UpdatedFacilityData =
      await getUpdatedFacilityReportDetails(version_id, facility_id);
    setFormData((prevFormData: object) => ({
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
      onChange={(data: { formData: object }) => {
        setFormData((prevFormData: object) => ({
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
