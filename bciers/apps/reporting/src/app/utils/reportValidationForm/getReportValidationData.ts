import { actionHandler } from "@bciers/actions";
import { ValidationErrors } from "@reporting/src/app/components/validationErrors/types";

export type ReportValidationResponse = {
  errors: ValidationErrors;
};

export async function getReportValidationData(
  reportVersionId: number,
): Promise<ReportValidationResponse> {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/validation/validation-data`;

  const response = await actionHandler(endpoint, "GET");

  return response as ReportValidationResponse;
}
