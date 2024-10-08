import { actionHandler } from "@bciers/actions";

export const getReportingYear = async (): Promise<{
  reporting_year: number;
  report_due_date: string;
  reporting_window_end: string;
}> => {
  return actionHandler("reporting/reporting-year", "GET");
};
