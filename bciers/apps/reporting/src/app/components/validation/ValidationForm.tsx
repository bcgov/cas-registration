"use client";

import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import ReportValidationSummary from "@reporting/src/app/components/shared/validation/ReportValidationSummary";
import type { ReportValidationErrors } from "@reporting/src/app/components/shared/validation/types";

interface Props {
  navigationInformation: NavigationInformation;
  validationErrors?: ReportValidationErrors;
}

const ValidationForm: React.FC<Props> = ({
  navigationInformation,
  validationErrors,
}) => {
  return (
    <div className="p-6">
      <div className="container mx-auto p-4" data-testid="validation-review">
        <MultiStepHeader
          stepIndex={navigationInformation.headerStepIndex}
          steps={navigationInformation.headerSteps}
        />
      </div>

      <div className="flex w-full gap-4">
        <div className="hidden md:block">
          <ReportingTaskList elements={navigationInformation.taskList} />
        </div>

        <div className="w-full">
          <ReportValidationSummary errors={validationErrors} />

          <ReportingStepButtons
            backUrl={navigationInformation.backUrl}
            continueUrl={navigationInformation.continueUrl}
            buttonText="Continue"
            noSaveButton={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ValidationForm;
