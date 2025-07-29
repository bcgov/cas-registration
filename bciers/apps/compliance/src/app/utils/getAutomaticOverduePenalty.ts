import { actionHandler } from "@bciers/actions";
import { AutomaticOverduePenalty } from "@/compliance/src/app/types";

const getAutomaticOverduePenalty = async (
  complianceReportVersionId: number,
): Promise<AutomaticOverduePenalty> => {
  const response = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/automatic-overdue-penalty`,
    "GET",
    "",
  );

  if (response?.error) {
    throw new Error(
      `Failed to fetch automatic overdue penalty: ${response.error}`,
    );
  }

  return response;
};

export default getAutomaticOverduePenalty;
