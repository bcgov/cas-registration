import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import {
  ActivePage,
  getSignOffAndSubmitSteps,
} from "@reporting/src/app/components/taskList/5_signOffSubmit";
import FinalReviewForm from "@reporting/src/app/components/finalReview/FinalReviewForm";

export default async function FinalReviewPage({
  version_id,
}: HasReportVersion) {
  const taskListElements = getSignOffAndSubmitSteps(
    version_id,
    ActivePage.FinalReview,
  );

  return (
    <FinalReviewForm
      version_id={version_id}
      taskListElements={taskListElements}
    />
  );
}
