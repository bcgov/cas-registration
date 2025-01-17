import { actionHandler } from "@bciers/actions";

async function getOperationEmissionSummaryData(id: Number) {
  return actionHandler(
    `reporting/report-version/${id}/emission-summary`,
    "GET",
    `reporting/report-version/${id}/emission-summary`,
  );
}
export default getOperationEmissionSummaryData;
