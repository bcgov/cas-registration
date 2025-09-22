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
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { getReportFacilityList } from "@reporting/src/app/utils/getReportFacilityList";

export default async function ChangeReviewPage({
  version_id,
}: HasReportVersion) {
  // 🚀 Get form data
  const initialFormData = await getReportVersionDetails(version_id);

  const facilityList = await getReportFacilityList(version_id);
  const facilityCount = facilityList.facilities.length;

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

  return (
    <>
      <ChangeReviewForm
        versionId={version_id}
        initialFormData={initialFormData}
        navigationInformation={navInfo}
        registrationPurpose={registrationPurpose}
        displayChanges={facilityCount < 20}
      />
    </>
  );
}
