import { actionHandler } from "@bciers/actions";
import dayjs from "dayjs";

const getReportingYear = async (): Promise<{
  reporting_year: number;
  report_due_date: string;
  reporting_window_end: string;
  report_due_year: number;
  report_open_date: string;
  is_reporting_open: boolean;
}> => {
  const endpoint = "reporting/reporting-year";
  const response = await actionHandler(endpoint, "GET");

  return {
    ...response,
    report_due_year: dayjs(response.report_due_date).year(),
  };
};

export default getReportingYear;
