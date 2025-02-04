"use client";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Box,
  Alert,
  Checkbox,
  Typography,
  FormControlLabel,
} from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import FormBase from "@bciers/components/form/FormBase";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import {
  facilityReviewUiSchema,
  facilitySchema,
} from "@reporting/src/data/jsonSchema/facilities";
import { actionHandler } from "@bciers/actions";
import FormContext, { IChangeEvent } from "@rjsf/core";
import { useSearchParams } from "next/navigation";
import serializeSearchParams from "@bciers/utils/src/serializeSearchParams";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import { useRouter } from "next/navigation";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

interface Props {
  version_id: number;
  facility_id: string;
  operationType: string;
  activitiesData: [];
  facilityData: {
    facility_name: string;
    facility_type: string;
    facility_bcghgid: string;
    activities: [number];
  };
  taskListElements: TaskListElement[];
}

interface Activity {
  name: string;
  id: number;
}

const FacilityReview: React.FC<Props> = ({
  version_id,
  facility_id,
  activitiesData,
  facilityData,
  taskListElements,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [formData, setFormData] = useState<any>(facilityData);
  const [activities, setActivities] = useState<Record<number, boolean>>({});
  const [activityList, setActivityList] = useState<Activity[]>([]);
  const queryString = serializeSearchParams(useSearchParams());
  const backUrl = `/reports/${version_id}/person-responsible`;
  const continueURL = `activities${queryString}`;
  const router = useRouter();
  const formRef = useRef<FormContext>(null);
  useEffect(() => {
    if (Array.isArray(activitiesData)) {
      const newActivityMap: Record<number, boolean> = {};
      activitiesData.forEach((activity: Activity) => {
        newActivityMap[activity.id] = facilityData.activities?.includes(
          activity.id,
        );
      });
      setActivities(newActivityMap);
      setActivityList(activitiesData);
    }
  }, [facilityData.activities, activitiesData]);

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number,
  ) => {
    const isChecked = event.target.checked;
    setActivities((prevActivities) => ({
      ...prevActivities,
      [id]: isChecked,
    }));

    setFormData((prevFormData: any) => ({
      ...prevFormData,
      activities: isChecked
        ? [...(prevFormData.activities || []), id]
        : prevFormData.activities?.filter(
            (activityId: number) => activityId !== id,
          ),
    }));
  };

  const handleFormChange = (event: IChangeEvent) => {
    setFormData(event.formData);
  };

  const handleSave = async () => {
    setIsSaving(true); // Start loading when save is clicked
    const updatedFacility = {
      ...formData,
      activities: Object.keys(activities).filter((id) => activities[+id]),
    };

    const method = "POST";
    const endpoint = `reporting/report-version/${version_id}/facility-report/${facility_id}`;
    const pathToRevalidate = `reporting/report-version/${version_id}/facility-report/${facility_id}`;
    const formDataObject = JSON.parse(JSON.stringify(updatedFacility));

    try {
      await actionHandler(endpoint, method, pathToRevalidate, {
        body: JSON.stringify(formDataObject),
      });

      if (canContinue) {
        setIsRedirecting(true);
        router.push(continueURL);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }
    } catch (error: any) {
      setErrorList([error.message || "An error occurred"]);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }
  };

  const submitExternallyToContinue = () => {
    setCanContinue(true);
  }; // Only submit after canContinue is set so the submitHandler can read the boolean
  useEffect(() => {
    if (formRef.current && canContinue) {
      formRef.current.submit();
    }
  }, [canContinue]);

  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="facility-review">
        <MultiStepHeader stepIndex={1} steps={multiStepHeaderSteps} />
      </div>
      <div className="w-full flex">
        <ReportingTaskList elements={taskListElements} />
        <div className="w-full md:max-w-[60%]">
          <FormBase
            formRef={formRef}
            schema={facilitySchema}
            uiSchema={facilityReviewUiSchema}
            formData={formData}
            onSubmit={handleSave}
            onChange={handleFormChange}
          >
            {errorList.length > 0 &&
              errorList.map((error, index) => (
                <Alert key={index} severity="error">
                  {error}
                </Alert>
              ))}
            {activityList.length > 0 && (
              <div>
                <Typography
                  variant="h6"
                  sx={{
                    width: "84px",
                    height: "22px",
                    fontFamily: "'Inter', sans-serif",
                    fontStyle: "normal",
                    fontWeight: 700,
                    fontSize: "18px",
                    lineHeight: "22px",
                    color: "#38598A",
                    flex: "none",
                    order: 0,
                    flexGrow: 0,
                  }}
                >
                  Activities
                </Typography>
                <Box sx={{ display: "block" }}>
                  {activityList.map((activity) => (
                    <FormControlLabel
                      key={activity.id}
                      control={
                        <Checkbox
                          checked={activities[activity.id] || false}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            handleCheckboxChange(event, activity.id)
                          }
                        />
                      }
                      label={activity.name || `Activity ${activity.id}`}
                      sx={{ display: "block", marginBottom: 0.1 }}
                    />
                  ))}
                </Box>
              </div>
            )}
            <ReportingStepButtons
              backUrl={backUrl}
              continueUrl={continueURL}
              isSaving={isSaving}
              isSuccess={isSuccess}
              isRedirecting={isRedirecting}
              saveButtonDisabled={false}
              saveAndContinue={submitExternallyToContinue}
            />
          </FormBase>
        </div>
      </div>
    </Box>
  );
};

export default FacilityReview;
