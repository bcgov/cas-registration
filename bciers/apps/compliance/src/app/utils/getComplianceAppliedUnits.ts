import { actionHandler } from "@bciers/actions";
import { ComplianceAppliedUnits } from "@/compliance/src/app/types";

const getComplianceAppliedUnits = async (
  complianceReportVersionId: string,
): Promise<Array<ComplianceAppliedUnits>> => {
  const appliedUnits: Array<ComplianceAppliedUnits> = await actionHandler(
    `compliance/bccr/compliance-report-versions/${complianceReportVersionId}/applied-compliance-units`,
    "GET",
    "",
  );
  return appliedUnits;
};

export default getComplianceAppliedUnits;
