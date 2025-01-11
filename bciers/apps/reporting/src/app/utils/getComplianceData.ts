import { actionHandler } from "@bciers/actions";
export async function getComplianceData(versionId: number) {
  const response = await actionHandler(
    `reporting/report-version/${versionId}/compliance-data`,
    "GET",
  );
  if (response.error) {
    throw new Error("We couldn't find the compliance data for this report.");
  }
  return response;
}
