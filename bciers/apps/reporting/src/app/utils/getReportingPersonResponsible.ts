import { actionHandler } from "@bciers/actions";

export async function getReportingPersonResponsible(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/person-responsible`;
  const response = await actionHandler(endpoint, "GET");
  if (response && response.error) {
    throw new Error(
      `Failed to fetch the person responsible for report version ${reportVersionId}.\n` +
        "Please check if the provided ID(s) are correct and try again.",
    );
  }
  return response;
}
