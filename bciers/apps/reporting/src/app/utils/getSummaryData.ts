import { actionHandler } from "@bciers/actions";
export async function getSummaryData(versionId: number, facilityId: string) {
  const response = await actionHandler(
    `reporting/report-version/${versionId}/facility-report/${facilityId}/emission-summary`,
    "GET",
  );
  if (response.error) {
    throw new Error("We couldn't find the summary data for this report.");
  }
  return response;
}
