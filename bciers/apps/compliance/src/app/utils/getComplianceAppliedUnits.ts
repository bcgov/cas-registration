import { actionHandler } from "@bciers/actions";
import {
  ComplianceAppliedUnits,
  ComplianceAppliedUnitsData,
} from "@/compliance/src/app/types";

const getComplianceAppliedUnits = async (
  complianceReportVersionId: string,
): Promise<ComplianceAppliedUnitsData> => {
  const data: Array<ComplianceAppliedUnits> = await actionHandler(
    `compliance/bccr/compliance-report-versions/${complianceReportVersionId}/applied-compliance-units`,
    "GET",
    "",
  );
  return {
    rows: data,
    row_count: data.length || 0,
  };
};

export default getComplianceAppliedUnits;
