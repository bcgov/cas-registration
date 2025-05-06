import { actionHandler } from "@bciers/actions";

export async function getReportNeedsVerification(reportVersionId: number) {
  // 🚀 Fetch the operation associated with the specified version ID
  const endpoint = `reporting/report-version/${reportVersionId}/report-needs-verification`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the verification requirement for report version ${reportVersionId}.`,
    );
  }
  return response;
}
