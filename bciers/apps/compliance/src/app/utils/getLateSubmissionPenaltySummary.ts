import { actionHandler } from "@bciers/actions";
import { PenaltyData } from "@/compliance/src/app/types";

export const getLateSubmissionPenaltySummary = async (
  complianceReportVersionId: number,
): Promise<PenaltyData> => {
  const data = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/late-submission-penalty-summary`,
    "GET",
    "",
  );

  return data as PenaltyData;
};
