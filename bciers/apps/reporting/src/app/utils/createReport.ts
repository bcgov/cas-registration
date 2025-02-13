import { actionHandler } from "@bciers/actions";

export async function createReport(operationId: string, reportingYear: number) {
  const response = await actionHandler("reporting/create-report", "POST", "", {
    body: JSON.stringify({
      operation_id: operationId,
      reporting_year: reportingYear,
    }),
  });
  return response;
}
