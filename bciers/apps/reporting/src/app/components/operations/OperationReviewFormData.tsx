import OperationReview from "./OperationReview";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getAllActivities } from "@reporting/src/app/utils/getAllReportingActivities";
import { getRegulatedProducts } from "@bciers/actions/api";

export default async function OperationReviewFormData({
  version_id,
}: {
  version_id: number;
}) {
  const reportOperation = await getReportingOperation(version_id);
  const allActivities = await getAllActivities();
  const allRegulatedProducts = await getRegulatedProducts();
  const reportingYear = await getReportingYear();
  return (
    <OperationReview
      formData={reportOperation}
      version_id={version_id}
      allActivities={allActivities}
      reportingYear={reportingYear}
      allRegulatedProducts={allRegulatedProducts}
    />
  );
}
