import { actionHandler } from "@bciers/actions";
import { ComplianceSummary } from "@/compliance/src/app/types";

export const getComplianceSummary = async (
  complianceReportVersionId: number,
): Promise<ComplianceSummary> => {
  return actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}`,
    "GET",
    "",
  );
};
