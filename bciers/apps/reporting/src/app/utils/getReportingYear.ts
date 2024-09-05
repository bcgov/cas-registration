import { actionHandler } from "@bciers/actions";

export const getReportingYear = async (): Promise<{
  reporting_year: number;
  report_due_date: string;
}> => {
  return await actionHandler("reporting/reporting-year", "GET");
};
