import { actionHandler } from "@bciers/actions";

export const getReportingDueDate = async (): Promise<string> => {
  const reportingDueDate = await actionHandler(
    "reporting/reporting-due-date",
    "GET",
  );

  return reportingDueDate;
};
