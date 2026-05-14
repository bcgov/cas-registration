import { actionHandler } from "@bciers/actions";
import { ReportingFormResponse } from "@reporting/src/app/utils/typesApiV2";
import { ComplianceSummaryFormPayload } from "@reporting/src/app/components/complianceSummary/types";

type ComplianceSummaryFormResponse =
  ReportingFormResponse<ComplianceSummaryFormPayload>;

export async function getComplianceData(
  reportVersionId: number,
): Promise<ComplianceSummaryFormResponse> {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/forms/compliance-summary-data`;

  const response: ComplianceSummaryFormResponse | { error: string } =
    await actionHandler(endpoint, "GET");

  if ("error" in response) {
    throw new Error(response.error);
  }

  return response;
}
