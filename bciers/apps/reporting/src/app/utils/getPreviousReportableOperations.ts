import { actionHandler } from "@bciers/actions";

export default async function getPreviousReportableOperations() {
  return actionHandler(
    `registration/operations/reportable/previous`,
    "GET",
    "",
  );
}
