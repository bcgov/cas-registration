import { actionHandler } from "@bciers/actions";

export default async function getUserComplianceAccessStatus(
  complianceReportVersionId?: number,
) {
  const endpoint = `compliance/user-compliance-access-status?compliance_report_version_id=${complianceReportVersionId}`;

  return actionHandler(endpoint, "GET");
}
