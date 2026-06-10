import { actionHandler } from "@bciers/actions";

export type ReportingYearScope = "all" | "past";

async function getReportingYears(scope: ReportingYearScope = "all") {
  const query = scope === "all" ? "" : `?scope=${scope}`;

  return actionHandler(`reporting/reporting-years${query}`, "GET", "");
}

export default getReportingYears;
