import { actionHandler } from "@bciers/actions";
import {
  ReportingFormResponse,
  ComplianceSummaryPayload,
} from "@reporting/src/app/types";

type ComplianceSummaryResponse =
  ReportingFormResponse<ComplianceSummaryPayload>;

export async function getComplianceData(
  reportVersionId: number,
): Promise<ComplianceSummaryResponse> {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/forms/compliance-data`;

  const response = await actionHandler(endpoint, "GET");

  if ((response as any).error) {
    throw new Error(
      `Failed to fetch the compliance data for report version ${reportVersionId}.`,
    );
  }

  return response as ComplianceSummaryResponse;
}
