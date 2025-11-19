import { actionHandler } from "@bciers/actions";
import dayjs from "dayjs";

export const getReportingYear = async (): Promise<{
  reporting_year: number;
  report_due_date: string;
  reporting_window_end: string;
  report_due_year: number;
  report_open_date: string;
}> => {
  const endpoint = "reporting/reporting-year";
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(`Failed to fetch the reporting for report year.`);
  }

  return {
    ...response,
    report_due_year: dayjs(response.report_due_date).year(),
  };
};
