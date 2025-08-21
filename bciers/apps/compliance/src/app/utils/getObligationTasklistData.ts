import { actionHandler } from "@bciers/actions";
import { ObligationTasklistData } from "@/compliance/src/app/types";

export const getObligationTasklistData = async (
  complianceReportVersionId: number,
): Promise<ObligationTasklistData> => {
  const data = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/obligation-tasklist`,
    "GET",
    "",
  );

  if (data?.error) {
    throw new Error(`Failed to fetch tasklist data: ${data.error}`);
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid response format from tasklist data endpoint");
  }

  return data as ObligationTasklistData;
};
