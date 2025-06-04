import { actionHandler } from "@bciers/actions";

export async function getUpdatedReportOperationDetails(
  reportVersionId: number,
) {
  return actionHandler(
    `reporting/report-version/${reportVersionId}/report-operation/update`,
    "PATCH",
    "",
  );
}
