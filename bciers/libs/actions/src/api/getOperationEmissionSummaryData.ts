import { actionHandler } from "@bciers/actions";

export async function getOperationEmissionSummaryData(versionId: number) {
  const response = await actionHandler(
    `reporting/report-version/${versionId}/emission-summary`,
    "GET",
  );
  return response;
}
