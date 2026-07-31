import { actionHandler } from "@bciers/actions";
import { PenaltyData } from "@/compliance/src/app/types";

export const getPenaltyData = async (
  complianceReportVersionId: number,
): Promise<PenaltyData> => {
  const data = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/automatic-overdue-penalty-summary`,
    "GET",
    "",
  );

  return data as PenaltyData;
};
