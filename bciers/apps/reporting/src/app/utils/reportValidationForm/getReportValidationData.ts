import { actionHandler } from "@bciers/actions";
import { ReportingFormResponse } from "@reporting/src/app/utils/typesApiV2";
import { ReportValidationErrors } from "@reporting/src/app/components/shared/validation/types";

type ReportValidationPayload = {
  errors: ReportValidationErrors;
};

type ReportValidationFormResponse =
  ReportingFormResponse<ReportValidationPayload>;

export async function getReportValidationData(
  reportVersionId: number,
): Promise<ReportValidationFormResponse> {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/forms/validation-data`;

  const response = await actionHandler(endpoint, "GET");

  if ((response as any).error) {
    throw new Error(
      `Failed to fetch validation data for report version ${reportVersionId}.`,
    );
  }

  return response as ReportValidationFormResponse;
}
