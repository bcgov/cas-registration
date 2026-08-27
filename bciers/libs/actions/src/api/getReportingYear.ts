import { actionHandler } from "@bciers/actions";
import type { ApiSchema } from "@bciers/api";

type ReportingYear = ApiSchema<"ReportingYearOut">;

const getReportingYear = async (): Promise<ReportingYear> => {
  const endpoint = "reporting/reporting-year";
  return actionHandler(endpoint, "GET");
};

export default getReportingYear;
