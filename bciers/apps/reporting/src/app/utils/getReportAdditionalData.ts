import { actionHandler } from "@bciers/actions";

export async function getReportAdditionalData(version_id: number) {
  return actionHandler(
    `reporting/report-version/${version_id}/report-additional-data`,
    "GET",
  );
}
