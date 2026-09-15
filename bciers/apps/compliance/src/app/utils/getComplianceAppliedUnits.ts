import { actionHandler } from "@bciers/actions";
import { ComplianceAppliedUnitsData } from "@/compliance/src/app/types";
import { captureException } from "@bciers/sentryConfig/sentry";

const getComplianceAppliedUnits = async (
  complianceReportVersionId: number,
): Promise<ComplianceAppliedUnitsData> =>
  await actionHandler(
    `compliance/bccr/compliance-report-versions/${complianceReportVersionId}/applied-compliance-units`,
    "GET",
    "",
  )
    .then((response) => {
      const data = response.applied_compliance_units;
      const canApplyComplianceUnits = response.can_apply_compliance_units;
      return {
        rows: data,
        row_count: data.length || 0,
        can_apply_compliance_units: canApplyComplianceUnits,
      };
    })
    .catch((err) => {
      captureException(err instanceof Error ? err : new Error(String(err)));
      return {
        rows: [],
        row_count: 0,
        can_apply_compliance_units: false,
        connection_error: true,
      };
    });

export default getComplianceAppliedUnits;
