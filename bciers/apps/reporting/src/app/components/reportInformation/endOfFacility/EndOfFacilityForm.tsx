"use client";
import { Box } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import NavigationForm from "@bciers/components/form/NavigationForm";
import ReportSubmissionEnd from "@reporting/src/app/components/reportInformation/endOfFacility/FacilityPageEnd";
import { NavigationInformation } from "../../taskList/types";

interface NonAttributableEmissionsProps {
  navigationInformation: NavigationInformation;
  facilityName: string;
}
export default function EndOfFacilityForm({
  navigationInformation,
  facilityName,
}: NonAttributableEmissionsProps) {
  const onSubmit = async () => {
    return true;
  };

  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="facility-review">
        <MultiStepHeader
          stepIndex={navigationInformation.headerStepIndex}
          steps={navigationInformation.headerSteps}
        />
      </div>
      <div className="w-full flex">
        <div className="hidden md:flex flex-col">
          <ReportingTaskList elements={navigationInformation.taskList} />
        </div>
        <div className="w-full">
          <div className={"mt-10 mb-40 mr-40"}>
            <ReportSubmissionEnd facilityName={facilityName} />
          </div>
          <div className="flex flex-col justify-end mt-10">
            <NavigationForm
              key="form-buttons"
              schema={{}}
              backUrl={navigationInformation.backUrl}
              continueUrl={navigationInformation.continueUrl}
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
