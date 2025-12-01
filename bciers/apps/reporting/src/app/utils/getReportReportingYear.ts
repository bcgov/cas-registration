import { actionHandler } from "@bciers/actions";
import dayjs from "dayjs";

export const getReportReportingYear = async (
  reportId: number,
): Promise<{
  reporting_year: number;
  report_due_date: string;
  reporting_window_end: string;
  report_due_year: number;
}> => {
  const endpoint = `reporting/reporting-year/${reportId}`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the reporting year for the report with ID ${reportId}.`,
    );
  }

  return {
    ...response,
    report_due_year: dayjs(response.report_due_date).year(),
  };
};
