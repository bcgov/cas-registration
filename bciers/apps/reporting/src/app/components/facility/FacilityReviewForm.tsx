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
import { tasklistData } from "@reporting/src/app/components/facility/TaskListElements";
import {
  facilityReviewUiSchema,
  facilitySchema,
} from "@reporting/src/data/jsonSchema/facilities";
import { RJSFSchema } from "@rjsf/utils";
import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";
import FormContext, { IChangeEvent } from "@rjsf/core";
import { useSearchParams } from "next/navigation";
import serializeSearchParams from "@bciers/utils/src/serializeSearchParams";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import { useRouter } from "next/navigation";

interface Props {
  version_id: number;
  facility_id: string;
}

interface Activity {
  name: string;
  id: number;
}

const getFacilityReport = async (version_id: number, facility_id: string) => {
  return actionHandler(
    `reporting/report-version/${version_id}/facility-report/${facility_id}`,
    "GET",
    `reporting/report-version/${version_id}/facility-report/${facility_id}`,
  );
};

const getAllActivities = async () => {
  return actionHandler(`reporting/activities`, "GET", `reporting/activities`);
};

const FacilityReviewForm: React.FC<Props> = ({ version_id, facility_id }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [activities, setActivities] = useState<Record<number, boolean>>({});
  const [facilityReviewSchema, setFacilityReviewSchema] = useState<RJSFSchema>({
    type: "object",
    properties: {},
  });
  const [activityList, setActivityList] = useState<Activity[]>([]);
  const queryString = serializeSearchParams(useSearchParams());
  const backUrl = `/reports/${version_id}/person-responsible`;
  const continueURL = `activities${queryString}`;
  const router = useRouter();
  const formRef = useRef<FormContext>(null);

  const customStepNames = [
    "Operation Information",
    "Facilities Information",
    "Compliance Summary",
    "Sign-off & Submit",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facilityData = await getFacilityReport(version_id, facility_id);
        const activitiesData = await getAllActivities();
        const validActivitiesData = Array.isArray(activitiesData)
          ? activitiesData
          : [];

        setFormData(facilityData);
        setFacilityReviewSchema(facilitySchema);

        const activityMap: Record<number, boolean> = {};
        validActivitiesData.forEach((activity: Activity) => {
          activityMap[activity.id] = facilityData.activities?.includes(
            activity.id,
          );
        });
        setActivities(activityMap);
        setActivityList(validActivitiesData);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setErrorList([error.message || "An error occurred"]);
      }
    };

    fetchData().then(() => console.log());
  }, [version_id, facility_id]);

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
        <MultiStepHeader stepIndex={1} steps={customStepNames} />
      </div>
      <div className="w-full flex">
        <ReportingTaskList elements={tasklistData} />
        <div className="w-full md:max-w-[60%]">
          <FormBase
            formRef={formRef}
            schema={facilityReviewSchema}
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

export default FacilityReviewForm;
