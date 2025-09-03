import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getReportVersionDetails } from "@reporting/src/app/utils/getReportVersionDetails";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import ChangeReviewForm from "./ChangeReviewForm";
import { getChangeReviewData } from "@reporting/src/app/utils/getReviewChangesData";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { RegistrationPurposes } from "@/registration/app/components/operations/registration/enums";

export default async function ChangeReviewPage({
  version_id,
}: HasReportVersion) {
  // 🚀 Get form data
  const initialFormData = await getReportVersionDetails(version_id);
  const changes = await getChangeReviewData(version_id);

  // 🔍 Check if is a supplementary report
  const isSupplementaryReport = await getIsSupplementaryReport(version_id);
  //🔍 Check if needs verification
  const { show_verification_page: showVerificationPage } =
    await getReportVerificationStatus(version_id);

  const registrationPurpose = (await getRegistrationPurpose(version_id))
    .registration_purpose;

  // Build task list
  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.ChangeReview,
    version_id,
    "",
    {
      skipVerification: !showVerificationPage,
      skipChangeReview: !isSupplementaryReport,
    },
  );
  const showChanges = [
    RegistrationPurposes.OBPS_REGULATED_OPERATION,
    RegistrationPurposes.OPTED_IN_OPERATION,
  ].includes(registrationPurpose);

  const isReportingOnly =
    registrationPurpose === RegistrationPurposes.REPORTING_OPERATION;

  return (
    <>
      <ChangeReviewForm
        versionId={version_id}
        initialFormData={initialFormData}
        navigationInformation={navInfo}
        changes={changes.changed}
        showChanges={showChanges}
        isReportingOnly={isReportingOnly}
      />
    </>
  );
}
