import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import FinalReviewForm from "@reporting/src/app/components/finalReview/FinalReviewForm";
import reviewDataFactory, {
  ReviewData,
} from "@reporting/src/app/components/finalReview/reviewDataFactory/factory";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import { getFlowData } from "@reporting/src/app/components/taskList/reportingFlows";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";

export default async function FinalReviewPage({
  version_id,
}: HasReportVersion) {
  // Get the report version flow data definitions
  const flowData = await getFlowData(version_id);

  // Build final review data based on the report version flow type
  const finalReviewData: ReviewData[] = await reviewDataFactory(
    version_id,
    flowData,
  );

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
    <FinalReviewForm navigationInformation={navInfo} data={finalReviewData} />
  );
}
