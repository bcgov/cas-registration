import { actionHandler } from "@bciers/actions";

export async function getOperationEmissionSummaryData(versionId: number) {
  const response = await actionHandler(
    `reporting/report-version/${versionId}/emission-summary`,
    "GET",
  );
  if (response.error) {
    throw new Error("We couldn't find the summary data for this report.");
  }
  return response;
}
