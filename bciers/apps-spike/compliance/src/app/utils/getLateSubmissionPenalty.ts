import { actionHandler } from "@bciers/actions";
import { LateSubmissionPenalty } from "@/compliance/src/app/types";

const getLateSubmissionPenalty = async (
  complianceReportVersionId: number,
): Promise<LateSubmissionPenalty> => {
  const response = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/late-submission-penalty`,
    "GET",
    "",
  );

  if (response?.error) {
    throw new Error(
      `Failed to fetch late submission penalty: ${response.error}`,
    );
  }

  return response;
};

export default getLateSubmissionPenalty;
