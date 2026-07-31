import { actionHandler } from "@bciers/actions";
import { ManualHandlingData } from "@/compliance/src/app/types";

export const getManualHandlingData = async (
  complianceReportVersionId: number,
): Promise<ManualHandlingData> => {
  const endpoint = `compliance/compliance-report-versions/${complianceReportVersionId}/manual-handling`;
  const response = await actionHandler(endpoint, "GET");
  return response as ManualHandlingData;
};
