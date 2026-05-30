import { actionHandler } from "@bciers/actions";
import { ReportValidationErrors } from "@reporting/src/app/components/shared/validation/types";

export type ReportValidationResponse = {
  errors: ReportValidationErrors;
};

export async function getReportValidationData(
  reportVersionId: number,
): Promise<ReportValidationResponse> {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/validation/validation-data`;

  const response = await actionHandler(endpoint, "GET");

  if ((response as any).error) {
    throw new Error(
      `Failed to fetch validation data for report version ${reportVersionId}.`,
    );
  }

  return response as ReportValidationResponse;
}
