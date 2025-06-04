import { actionHandler } from "@bciers/actions";

export async function getReviewOperationInformationPageData(
  reportVersionId: number,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/report-operation-data`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the operation for report version ${reportVersionId}.`,
    );
  }
  return response;
}
