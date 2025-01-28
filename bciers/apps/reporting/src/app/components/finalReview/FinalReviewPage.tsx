import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import {
  ActivePage,
  getSignOffAndSubmitSteps,
} from "@reporting/src/app/components/taskList/5_signOffSubmit";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
import FinalReviewForm from "@reporting/src/app/components/finalReview/FinalReviewForm";
import reviewDataFactory, { ReviewData } from "./reviewDataFactory/factory";

export default async function FinalReviewPage({
  version_id,
}: HasReportVersion) {
  //🔍 Check if reports need verification
  const needsVerification = await getReportNeedsVerification(version_id);
  const taskListElements = await getSignOffAndSubmitSteps(
    version_id,
    ActivePage.FinalReview,
    needsVerification,
  );

  const finalReviewData: ReviewData[] = await reviewDataFactory(version_id);

  return (
    <FinalReviewForm
      version_id={version_id}
      taskListElements={taskListElements}
      data={finalReviewData}
      needsVerification={needsVerification}
    />
  );
}
