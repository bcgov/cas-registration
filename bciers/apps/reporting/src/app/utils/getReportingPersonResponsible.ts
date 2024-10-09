import { actionHandler } from "@bciers/actions";

export function getReportingPersonResponsible(version_id: number) {
  return actionHandler(
    `reporting/report-version/${version_id}/person-responsible`,
    "GET",
    `reporting/report-version/${version_id}/person-responsible`,
  );
}
