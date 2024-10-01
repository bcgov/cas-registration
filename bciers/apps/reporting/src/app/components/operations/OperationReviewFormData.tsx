import OperationReview from "./OperationReview";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getAllActivities } from "@reporting/src/app/utils/getAllReportingActivities";
import { getAllRegulatedProducts } from "@reporting/src/app/utils/getAllRegulatedProducts";

export default async function OperationReviewFormData({
  version_id,
}: {
  version_id: number;
}) {
  const reportOperation = await getReportingOperation(version_id);
  const allActivities = await getAllActivities();
  const allRegulatedProducts = await getAllRegulatedProducts();
  const reportingYear = await getReportingYear();
  return (
    <OperationReview
      existingFormData={reportOperation}
      version_id={version_id}
      allActivities={allActivities}
      reportingYear={reportingYear}
      allRegulatedProducts={allRegulatedProducts}
    />
  );
}
