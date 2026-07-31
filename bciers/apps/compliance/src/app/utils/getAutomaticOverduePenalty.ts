import { actionHandler } from "@bciers/actions";
import { AutomaticOverduePenalty } from "@/compliance/src/app/types";

const getAutomaticOverduePenalty = async (
  complianceReportVersionId: number,
): Promise<AutomaticOverduePenalty> => {
  return actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/automatic-overdue-penalty`,
    "GET",
    "",
  );
};

export default getAutomaticOverduePenalty;
