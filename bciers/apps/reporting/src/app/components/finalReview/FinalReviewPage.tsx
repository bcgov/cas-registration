import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";

import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { FinalReviewForm } from "@reporting/src/app/components/finalReview/FinalReviewForm";

export default async function FinalReviewPage({
  version_id,
}: HasReportVersion) {
  //🔍 Check if is a supplementary report
  const isSupplementaryReport = await getIsSupplementaryReport(version_id);

  //🔍 Check if reports need verification
  const { show_verification_page: showVerificationPage } =
    await getReportVerificationStatus(version_id);

  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.FinalReview,
    version_id,
    "",
    {
      skipVerification: !showVerificationPage,
      skipChangeReview: !isSupplementaryReport,
    },
  );

  return (
    <FinalReviewForm version_id={version_id} navigationInformation={navInfo} />
  );
}
