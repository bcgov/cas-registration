import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import reviewDataFactory, {
  ReviewData,
} from "@reporting/src/app/components/finalReview/reviewDataFactory/factory";
import { getFlowData } from "@reporting/src/app/components/taskList/reportingFlow";
import SubmittedForm from "./SubmittedForm";

export default async function SubmittedPage({ version_id }: HasReportVersion) {
  // Get the report version flow data definitions
  const flowData = await getFlowData(version_id);
  const finalReviewData: ReviewData[] = await reviewDataFactory(
    version_id,
    flowData,
  );

  return <SubmittedForm data={finalReviewData} />;
}
