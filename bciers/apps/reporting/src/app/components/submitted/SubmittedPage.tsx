import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import reviewDataFactory, {
  ReviewData,
} from "@reporting/src/app/components/finalReview/reviewDataFactory/factory";
import SubmittedForm from "./SubmittedForm";

export default async function SubmittedPage({ version_id }: HasReportVersion) {
  const finalReviewData: ReviewData[] = await reviewDataFactory(version_id);

  return <SubmittedForm data={finalReviewData} />;
}
