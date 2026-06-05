import { actionHandler } from "@bciers/actions";

export async function getIsSupplementaryReport(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/is-supplementary-report-version`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}
