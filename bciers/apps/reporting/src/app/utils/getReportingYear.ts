import { actionHandler } from "@bciers/actions";

export const getReportingYear = async (): Promise<{
  reporting_year: number;
  report_due_date: string;
  reporting_window_end: string;
}> => {
  const endpoint = "reporting/reporting-year";
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(`Failed to fetch the reporting for report year`);
  }
  return response;
};
