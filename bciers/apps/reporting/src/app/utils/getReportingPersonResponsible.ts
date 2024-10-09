import { actionHandler } from "@bciers/actions";
export async function getReportingPersonResponsible(version_id: number) {
  let response = await actionHandler(
    `reporting/report-version/${version_id}/person-responsible`,
    "GET",
    `reporting/report-version/${version_id}/person-responsible`,
  );
  if (!response.error) return response;
}
