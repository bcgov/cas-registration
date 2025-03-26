import { actionHandler } from "@bciers/actions";

export async function getOperationName(reportId: number) {
  const endpoint = `reporting/reports/${reportId}/operation`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the operation Name for report ${reportId}.`,
    );
  }
  return response;
}
