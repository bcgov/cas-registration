"use client";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import type { ReportValidationErrors } from "@reporting/src/app/components/shared/validation/types";
import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import ReportValidationSummary from "../shared/validation/ReportValidationSummary";
import AlertNote from "@bciers/components/form/components/AlertNote";
import { CheckCircleRounded } from "@mui/icons-material";

interface Props {
  navigationInformation: NavigationInformation;
  validationErrors?: ReportValidationErrors;
}

const ValidationForm: React.FC<Props> = ({
  navigationInformation,
  validationErrors,
}) => {
  const hasErrors = Boolean(
    validationErrors && Object.keys(validationErrors).length > 0,
  );

  return (
    <MultiStepWrapperWithTaskList
      steps={navigationInformation.headerSteps}
      initialStep={navigationInformation.headerStepIndex}
      taskListElements={navigationInformation.taskList}
      backUrl={navigationInformation.backUrl}
      continueUrl={navigationInformation.continueUrl}
      submittingButtonText="Continue"
      noSaveButton
    >
      <div className="w-full form-group field field-object form-heading-label">
        <div className="form-heading">Report validation</div>
      </div>

      {hasErrors ? (
        <ReportValidationSummary errors={validationErrors} />
      ) : (
        <AlertNote
          alertType="INFO"
          icon={<CheckCircleRounded sx={{ color: "#2E8540" }} />} // green check
        >
          No issues were detected by the automated validation. However, you may
          be contacted by Ministry staff in case additional questions are
          identified during report review.
        </AlertNote>
      )}
    </MultiStepWrapperWithTaskList>
  );
};

export default ValidationForm;
