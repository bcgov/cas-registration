"use client";
import React, { useState } from "react";
import {
  ActivityData,
  facilityReviewUiSchema,
} from "@reporting/src/data/jsonSchema/facilities";
import { actionHandler } from "@bciers/actions";
import { useSearchParams } from "next/navigation";
import serializeSearchParams from "@bciers/utils/src/serializeSearchParams";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { RJSFSchema } from "@rjsf/utils";

interface Props {
  version_id: number;
  facility_id: string;
  activitiesData: ActivityData[];
  taskListElements: TaskListElement[];
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
  taskListElements,
  formsData,
  schema,
}) => {
  const [formData, setFormData] = useState<any>(formsData);
  const queryString = serializeSearchParams(useSearchParams());
  const backUrl = `/reports/${version_id}/facilities/report-information`;
  const continueURL = `activities${queryString}`;
  const [errors, setErrors] = useState<string[] | undefined>();

  const handleSubmit = async () => {
    const method = "POST";
    const endpoint = `reporting/report-version/${version_id}/facility-report/${facility_id}`;
    const pathToRevalidate = `reporting/report-version/${version_id}/facility-report/${facility_id}`;

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
    const response = await actionHandler(endpoint, method, pathToRevalidate, {
      body: JSON.stringify(updatedFormData),
    });
    if (response?.error) {
      setErrors([response.error]);
      return false;
    }

    setErrors(undefined);
    return true;
  };

  return (
    <MultiStepFormWithTaskList
      schema={schema}
      uiSchema={facilityReviewUiSchema}
      formData={formData}
      onSubmit={handleSubmit}
      onChange={(data: any) => {
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          ...data.formData,
        }));
      }}
      continueUrl={continueURL}
      initialStep={1}
      steps={multiStepHeaderSteps}
      backUrl={backUrl}
      saveButtonDisabled={false}
      taskListElements={taskListElements}
      errors={errors}
    />
  );
};

export default FacilityReview;
