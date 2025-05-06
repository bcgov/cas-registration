import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
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
  //🔍 Check if reports need verification
  const needsVerification = await getReportNeedsVerification(version_id);
  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.ChangeReview,
    version_id,
    "",
    { skipVerification: !needsVerification },
  );

  return (
    <FinalReviewForm navigationInformation={navInfo} data={finalReviewData} />
  );
}
