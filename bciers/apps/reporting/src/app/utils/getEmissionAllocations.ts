import { actionHandler } from "@bciers/actions";

export async function getEmissionAllocations(
  report_version_id: number,
  facility_id: string,
) {
  const endpoint = `reporting/report-version/${report_version_id}/facilities/${facility_id}/allocate-emissions`;
  return actionHandler(endpoint, "GET", "");
}
