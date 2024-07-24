import { actionHandler } from "@bciers/actions";
import OperationReview from "./OperationReview";

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
  const reportOperation = await getReportOperation(version_id);

  return <OperationReview formData={reportOperation} version_id={version_id} />;
}
