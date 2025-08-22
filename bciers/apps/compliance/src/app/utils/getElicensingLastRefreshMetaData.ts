import { actionHandler } from "@bciers/actions";
import type { ElicensingLastRefreshData } from "@/compliance/src/app/types";

export async function getElicensingLastRefreshMetaData(
  complianceReportVersionId: number,
): Promise<ElicensingLastRefreshData> {
  const endpoint = `compliance/elicensing/compliance-report-versions/${complianceReportVersionId}/last-refresh-metadata`;
  const response = await actionHandler(endpoint, "GET", "");

  if (response?.error) {
    throw new Error(
      `Failed to fetch Elicensing LastRefreshData for compliance report version ${complianceReportVersionId}: ${response.error}`,
    );
  }

  return response;
}
