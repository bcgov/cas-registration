import ValidationForm from "@reporting/src/app/components/validation/ValidationForm";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import { getReportValidationData } from "@reporting/src/app/utils/reportValidationForm/getReportValidationData";

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
  const response = await getReportValidationData(version_id);
  const validationErrors = response.errors;
  return (
    <ValidationForm
      navigationInformation={navInfo}
      validationErrors={validationErrors}
    />
  );
}
