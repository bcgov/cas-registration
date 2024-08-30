import { actionHandler } from "@bciers/actions";

export async function getReportingOperation(version_id: number) {
  return actionHandler(
    `reporting/report-version/${version_id}/report-operation`,
    "GET",
    `reporting/report-version/${version_id}/report-operation`,
  );
}
