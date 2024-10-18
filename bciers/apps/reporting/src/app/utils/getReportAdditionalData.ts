import { actionHandler } from "@bciers/actions";

export async function getReportAdditionalData(version_id: number) {
  const response = await actionHandler(
    `reporting/report-version/${version_id}/report-additional-data`,
    "GET",
  );

  console.log("res", response);
  if (response && !response.error) {
    return response;
  }
}
