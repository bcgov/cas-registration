import { actionHandler } from "@bciers/actions";
import OperationReview from "./OperationReview";

const getAllActivities = async () => {
  return actionHandler(`reporting/activities`, "GET", `reporting/activities`);
};

const getAllRegulatedProducts = async () => {
  return actionHandler(`reporting/products`, "GET", `reporting/products`);
};

export async function getReportOperation(version_id: number) {
  return actionHandler(
    `reporting/report-version/${version_id}/report-operation`,
    "GET",
    `reporting/report-version/${version_id}/report-operation`,
  );
}

export default async function OperationReviewFormData({
  version_id,
}: {
  version_id: number;
}) {
  const reportOperation = (await getReportOperation(version_id)) || null;
  const allActivities = (await getAllActivities()) || [];
  const allRegulatedProducts = (await getAllRegulatedProducts()) || [];

  return (
    <OperationReview
      formData={reportOperation}
      version_id={version_id}
      allActivities={allActivities}
      allRegulatedProducts={allRegulatedProducts}
    />
  );
}
