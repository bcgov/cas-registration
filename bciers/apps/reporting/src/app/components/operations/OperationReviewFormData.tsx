import OperationReview from "./OperationReview";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getAllActivities } from "@reporting/src/app/utils/getAllReportingActivities";
import { getAllRegulatedProducts } from "@reporting/src/app/utils/getAllRegulatedProducts";
import { getReportType } from "@reporting/src/app/utils/getReportType";
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
  const reportType = await getReportType(version_id);
  return (
    <OperationReview
      formData={reportOperation}
      version_id={version_id}
      reportType={reportType}
      allActivities={allActivities}
      reportingYear={reportingYear}
      allRegulatedProducts={allRegulatedProducts}
    />
  );
}
