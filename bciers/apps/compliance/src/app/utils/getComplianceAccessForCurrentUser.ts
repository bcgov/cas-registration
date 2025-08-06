import { actionHandler } from "@bciers/actions";

export default async function getComplianceAccessForCurrentUser(
  complianceReportVersionId?: number,
) {
  const endpoint = `compliance/validate-user-compliance-access?compliance_report_version_id=${complianceReportVersionId}`;

  return actionHandler(endpoint, "GET");
}
