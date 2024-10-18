import { actionHandler } from "@bciers/actions";
export async function getReportType(version_id: number) {
  let response = await actionHandler(
    `reporting/report-version/${version_id}/report-type`,
    "GET",
    `reporting/report-version/${version_id}/report-type`,
  );
  if (!response.error) return response;
}
