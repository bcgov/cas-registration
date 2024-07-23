import { actionHandler } from "@bciers/actions";

export const getReportingYear = async (): Promise<number> => {
  const reportingYear = await actionHandler("reporting/reporting-year", "GET");

  return reportingYear;
};
