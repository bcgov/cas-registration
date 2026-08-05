import { actionHandler } from "@bciers/actions";
import { AccruingPenalties } from "@/compliance/src/app/types";

export const getAccruingPenalties = async (
  complianceReportVersionId: number,
): Promise<AccruingPenalties> => {
  return actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/obligation/accruing-penalties`,
    "GET",
    "",
  );
};
