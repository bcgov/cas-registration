import { actionHandler } from "@bciers/actions";

export async function createReportVersion(
  operationId: string,
  reportId: number,
) {
  const endpoint = `reporting/report/${reportId}/create-report-version`;
  const method = "POST";
  const payload = JSON.stringify({
    operation_id: operationId,
  });
  const response = await actionHandler(endpoint, method, "", {
    body: payload,
  });
  return response;
}
