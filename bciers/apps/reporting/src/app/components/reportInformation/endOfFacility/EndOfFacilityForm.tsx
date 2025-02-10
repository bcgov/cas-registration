"use client";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { Box } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import NavigationForm from "@bciers/components/form/NavigationForm";
import ReportSubmissionEnd from "@reporting/src/app/components/reportInformation/endOfFacility/FacilityPageEnd";

interface NonAttributableEmissionsProps {
  versionId: number;
  facilityId: string;
  taskListElements: TaskListElement[];
  facilityName: string;
}
export default function EndOfFacilityForm({
  versionId,
  facilityId,
  taskListElements,
  facilityName,
}: NonAttributableEmissionsProps) {
  const backUrl = `/reports/${versionId}/facilities/${facilityId}/allocation-of-emissions`;
  const saveAndContinueUrl = `/reports/${versionId}/facilities/report-information`;

  const onSubmit = async () => {
    return true;
  };

  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="facility-review">
        <MultiStepHeader stepIndex={1} steps={multiStepHeaderSteps} />
      </div>
      <div className="w-full flex">
        <div className="hidden md:flex flex-col">
          <ReportingTaskList elements={taskListElements} />
        </div>
        <div className="w-full">
          <div className={"mt-10 mb-40 mr-40"}>
            <ReportSubmissionEnd facilityName={facilityName} />
          </div>
          <div className="flex flex-col justify-end mt-10">
            <NavigationForm
              key="form-buttons"
              schema={{}}
              backUrl={backUrl}
              continueUrl={saveAndContinueUrl}
              buttonText={"Return to all facility reports"}
              formData={{}}
              onSubmit={onSubmit}
              noSaveButton={true}
            />
          </div>
        </div>
      </div>
    </Box>
  );
}
