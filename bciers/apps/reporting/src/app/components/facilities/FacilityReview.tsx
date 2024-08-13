"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Alert,
  Checkbox,
  Typography,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import FormBase from "@bciers/components/form/FormBase";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { tasklistData } from "@reporting/src/app/components/facilities/TaskListElements";
import {
  facilityReviewUiSchema,
  facilitySchema,
} from "@reporting/src/data/jsonSchema/facilities";
import { RJSFSchema } from "@rjsf/utils";
import { actionHandler } from "@bciers/actions";

interface Props {
  version_id: number;
  facility_id: number;
}

interface Activity {
  name: string;
  id: number;
}

const getReportFacilities = async (version_id: number, facility_id: number) => {
  return actionHandler(
    `reporting/report-version/${version_id}/report-facility/${facility_id}`,
    "GET",
    `reporting/report-version/${version_id}/report-facility/${facility_id}`,
  );
};

const getAllActivities = async () => {
  return actionHandler(`reporting/activities`, "GET", `reporting/activities`);
};

const FacilityReview: React.FC<Props> = ({ version_id, facility_id }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [activities, setActivities] = useState<Record<number, boolean>>({});
  const [facilityReviewSchema, setFacilityReviewSchema] = useState<RJSFSchema>({
    type: "object",
    properties: {},
  });
  const [activityList, setActivityList] = useState<Activity[]>([]);

  const customStepNames = [
    "Operation Information",
    "Facilities Information",
    "Compliance Summary",
    "Sign-off & Submit",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facilityData = await getReportFacilities(version_id, facility_id);
        const activitiesData = await getAllActivities();
        console.log("facility data", facilityData);
        const validActivitiesData = Array.isArray(activitiesData)
          ? activitiesData
          : [];

        setFormData(facilityData);
        setFacilityReviewSchema(facilitySchema);

        const activityMap: Record<number, boolean> = {};
        validActivitiesData.forEach((activity: Activity) => {
          activityMap[activity.id] = facilityData.activities.includes(
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

    fetchData().then((r) => console.log());
  }, [version_id, facility_id]);

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number,
  ) => {
    setActivities((prevActivities) => ({
      ...prevActivities,
      [id]: event.target.checked,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true); // Start loading when save is clicked
    const updatedFacility = {
      ...formData,
      activities: Object.keys(activities).filter((id) => activities[+id]),
      // products should be included similarly if applicable
    };

    const method = "POST";
    const endpoint = `reporting/report-version/${version_id}/report-facility/${facility_id}`;
    const pathToRevalidate = `reporting/report-version/${version_id}/report-facility/${facility_id}`;
    const formDataObject = JSON.parse(JSON.stringify(updatedFacility));

    try {
      await actionHandler(endpoint, method, pathToRevalidate, {
        body: JSON.stringify(formDataObject),
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      });

      setIsSuccess(true);
      alert("Facility updated successfully!");
    } catch (error: any) {
      console.error("Error updating facility:", error);
      setErrorList([error.message || "An error occurred"]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4">
        <MultiStepHeader stepIndex={1} steps={customStepNames} />
      </div>
      <div className="w-full flex">
        <ReportingTaskList elements={tasklistData} />
        <div className="w-full md:max-w-[60%]">
          <FormBase
            schema={facilityReviewSchema}
            uiSchema={facilityReviewUiSchema}
            formData={formData}
            onSubmit={handleSave} // Use handleSave directly
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
                          onChange={(event) =>
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
            <div className="flex justify-end gap-3">
              <Button
                variant="contained"
                type="submit"
                aria-disabled={isLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress
                    data-testid="progressbar"
                    role="progressbar"
                    size={24}
                  />
                ) : isSuccess ? (
                  "Success"
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </FormBase>
        </div>
      </div>
    </Box>
  );
};

export default FacilityReview;
