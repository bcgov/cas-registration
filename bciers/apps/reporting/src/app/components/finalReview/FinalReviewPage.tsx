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
  ReportingFlowDescription,
} from "@reporting/src/app/components/taskList/types";
import {
  getFlow,
  reportingFlows,
} from "@reporting/src/app/components/taskList/reportingFlows";

export default async function FinalReviewPage({
  version_id,
}: HasReportVersion) {
  // Get the report version flow type
  const flow = await getFlow(version_id);
  const flowData = reportingFlows[flow] as ReportingFlowDescription;
  if (!flowData) throw Error(`No reporting flow found for ${flow}`);
  // Build final review data based on the report version flow type
  const finalReviewData: ReviewData[] = await reviewDataFactory(
    version_id,
    flowData,
  );
  //🔍 Check if reports need verification
  const needsVerification = await getReportNeedsVerification(version_id);
  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.FinalReview,
    version_id,
    "",
    { skipVerification: !needsVerification },
  );

  return (
    <FinalReviewForm navigationInformation={navInfo} data={finalReviewData} />
  );
}
