import { actionHandler } from "@bciers/actions";

async function getReportingYears(exclude_past?: boolean) {
  const query =
    exclude_past !== undefined ? `?exclude_past=${exclude_past}` : "";
  return actionHandler(`reporting/reporting-years${query}`, "GET", "");
}

export default getReportingYears;
