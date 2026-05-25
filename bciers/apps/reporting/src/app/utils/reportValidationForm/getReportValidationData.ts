import { actionHandler } from "@bciers/actions";
import { ReportValidationErrors } from "@reporting/src/app/components/shared/validation/types";
type ReportValidationResponse = {
  errors: ReportValidationErrors;
};

export async function getReportValidationData(
  reportVersionId: number,
): Promise<ReportValidationResponse> {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/validation/report-validation`;

  const response = await actionHandler(endpoint, "GET");

  if ((response as any).error) {
    throw new Error(
      `Failed to fetch validation data for report version ${reportVersionId}.`,
    );
  }

  return response as ReportValidationResponse;
}
