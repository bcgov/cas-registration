import { actionHandler } from "@bciers/actions";

export async function getNewEntrantData(version_id: number) {
  return await actionHandler(
    `reporting/report-version/${version_id}/new-entrant-data`,
    "GET",
    `reporting/report-version/${version_id}/new-entrant-data`,
  );
}
