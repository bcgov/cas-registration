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
import { getReportValidationData } from "@reporting/src/app/utils/reportValidationForm/getReportValidationData";
import { createGenericReportValidationError } from "@reporting/src/app/components/shared/validation/utils";

export default async function ValidationPage({
  version_id,
}: Readonly<HasReportVersion>) {
  // Check if is a supplementary report
  const isSupplementaryReport = await getIsSupplementaryReport(version_id);

  // Check if reports need verification
  const { show_verification_page: showVerificationPage } =
    await getReportVerificationStatus(version_id);

  // Build task navigator
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

  // Get form data - report validation data
  let validationErrors: ReportValidationErrors = [];
  try {
    const response = await getReportValidationData(version_id);
    validationErrors = response.payload.errors;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to load validation data", error);
    validationErrors = [
      createGenericReportValidationError(
        "Failed to load report validation data.",
      ),
    ];
  }
  return (
    <ValidationForm
      navigationInformation={navInfo}
      validationErrors={validationErrors}
    />
  );
}
