import { actionHandler } from "@bciers/actions";
import { ComplianceSummary } from "@/compliance/src/app/types";

export const getComplianceSummary = async (
  complianceReportVersionId: string,
): Promise<ComplianceSummary> => {
  const data = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}`,
    "GET",
    "",
  );
  if (data?.error) {
    throw new Error(`Failed to fetch compliance report version: ${data.error}`);
  }

  if (!data || typeof data !== "object") {
    throw new Error(
      "Invalid response format from compliance report version endpoint",
    );
  }

  return data;
};
