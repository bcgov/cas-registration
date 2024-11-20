import { actionHandler } from "@bciers/actions";
// Fetches the report verification data associated with the given report version ID
export async function getReportVerification(version_id: number) {
  const response = await actionHandler(
    `reporting/report-version/${version_id}/report-verification`,
    "GET",
  );
  if (response && !response.error) {
    return response;
  }
}
