import { actionHandler } from "@bciers/actions";

export async function deleteReportVersion(reportVersionId: number) {
  const response = await actionHandler(
    `reporting/report-version/${reportVersionId}`,
    "DELETE",
  );
  return response;
}
