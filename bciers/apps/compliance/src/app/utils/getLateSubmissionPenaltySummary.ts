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

  if (data?.error) {
    throw new Error(
      `Failed to fetch late submission penalty summary: ${data.error}`,
    );
  }

  if (!data || typeof data !== "object") {
    throw new Error(
      "Invalid response format from late submission penalty summary endpoint",
    );
  }

  return data as PenaltyData;
};
