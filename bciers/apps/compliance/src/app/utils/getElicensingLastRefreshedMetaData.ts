import type { ElicensingLastRefreshData } from "@/compliance/src/app/types";
import { safeFetchApi } from "@bciers/actions/api/safeFetchApi";

export async function getElicensingLastRefreshedMetaData(
  complianceReportVersionId: number,
): Promise<ElicensingLastRefreshData> {
  const endpoint = `compliance/elicensing/compliance-report-versions/${complianceReportVersionId}/last-refreshed-metadata`;

  return safeFetchApi<ElicensingLastRefreshData>(endpoint, {
    last_refreshed_display: "",
    data_is_fresh: false,
  });
}
