import { ReportData } from "../reportTypes";
import { FinalReviewCard } from "./FinalReviewCard";
import { FinalReviewTable } from "./Table";
import { operationFields } from "../finalReviewFields";

const ReviewOperatorInformation: React.FC<{
  data: ReportData;
  isEio: boolean;
}> = ({ data, isEio }) => {
  const fields = operationFields(isEio);

  return (
    <FinalReviewCard title="Review Operation Information">
      <FinalReviewTable data={data.report_operation} fields={fields} />
    </FinalReviewCard>
  );
};

export default ReviewOperatorInformation;
