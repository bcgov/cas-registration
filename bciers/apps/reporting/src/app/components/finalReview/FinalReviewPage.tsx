import { HasReportVersion } from "../../utils/defaultPageFactoryTypes";
import {
  ActivePage,
  getSignOffAndSubmitSteps,
} from "../taskList/5_signOffSubmit";
import FinalReviewForm from "./FinalReviewForm";

const FinalReviewPage: React.FC<HasReportVersion> = ({ version_id }) => {
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
};

export default FinalReviewPage;
