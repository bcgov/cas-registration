import { actionHandler } from "@bciers/actions";
import { PenaltyData } from "@/compliance/src/app/types";

export const getPenaltyData = async (
  complianceReportVersionId: number,
): Promise<PenaltyData> => {
  const data = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/penalty`,
    "GET",
    "",
  );

  if (data?.error) {
    throw new Error(`Failed to fetch penalty data: ${data.error}`);
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid response format from penalty data endpoint");
  }

  return data as PenaltyData;
};
