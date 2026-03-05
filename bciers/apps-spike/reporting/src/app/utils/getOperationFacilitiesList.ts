import { actionHandler } from "@bciers/actions";

export async function getOperationFacilitiesList(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/review-facilities`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the facility list for report version ${reportVersionId}.`,
    );
  }
  return response;
}
