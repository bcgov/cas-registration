import ValidationForm from "@reporting/src/app/components/validation/ValidationForm";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import { ReportValidationErrors } from "@reporting/src/app/components/shared/validation/types";

export default async function ValidationPage({ version_id }: HasReportVersion) {
  // Check if is a supplementary report
  const isSupplementaryReport = await getIsSupplementaryReport(version_id);

  // Check if reports need verification
  const { show_verification_page: showVerificationPage } =
    await getReportVerificationStatus(version_id);

  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.Validation,
    version_id,
    "",
    {
      skipVerification: !showVerificationPage,
      skipChangeReview: !isSupplementaryReport,
    },
  );

  const validationErrors: ReportValidationErrors = {
    error_operation_information: {
      severity: "error",
      context: {
        reportVersionId: 3,
      },
    },

    error_activity_value: {
      severity: "warning",
      context: {
        reportVersionId: 3,
        facilityId: "9f7b0848-021e-4d08-9852-10524c4e5457",
        activityName: "Boiler 1",
        fieldName: "fuel type",
        expectedRange: "10–20",
        userInput: "42",
      },
    },

    error_lime_kiln: {
      severity: "error",
      context: {
        reportVersionId: 3,
        facilityId: "9f7b0848-021e-4d08-9852-10524c4e5457",
      },
    },

    error_allocation: {
      severity: "warning",
      context: {
        reportVersionId: 3,
        facilityId: "9f7b0848-021e-4d08-9852-10524c4e5457",
      },
    },
  };

  return (
    <ValidationForm
      navigationInformation={navInfo}
      validationErrors={validationErrors}
    />
  );
}
