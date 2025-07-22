import { actionHandler } from "@bciers/actions";
import { ComplianceAppliedUnitsData } from "@/compliance/src/app/types";

const getComplianceAppliedUnits = async (
  complianceReportVersionId: number,
): Promise<ComplianceAppliedUnitsData> => {
  const response = await actionHandler(
    `compliance/bccr/compliance-report-versions/${complianceReportVersionId}/applied-compliance-units`,
    "GET",
    "",
  );
  const data = response.applied_compliance_units;
  const can_apply_units = response.can_apply_units;
  return {
    rows: data,
    row_count: data.length || 0,
    can_apply_units: can_apply_units,
  };
};

export default getComplianceAppliedUnits;
