import { actionHandler } from "@bciers/actions";

export async function getNewEntrantData(version_id: number) {
  let response = await actionHandler(
    `reporting/report-version/${version_id}/new-entrant-data`,
    "GET",
    `reporting/report-version/${version_id}/new-entrant-data`,
  );

  if (response && !response.error) {
    return response;
  }
}
