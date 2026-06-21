import { actionHandler } from "@bciers/actions";

export async function getReportingPersonResponsible(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/person-responsible`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}
