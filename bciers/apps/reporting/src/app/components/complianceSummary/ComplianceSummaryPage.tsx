import ComplianceSummaryForm from "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm";
import { tasklistData } from "./TaskListElements";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getComplianceData } from "@reporting/src/app/utils/getComplianceData";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";

export default async function ComplianceSummaryPage({
  version_id,
}: HasReportVersion) {
  const complianceData = await getComplianceData(version_id);
  //🔍 Check if reports need verification
  const needsVerification = await getReportNeedsVerification(version_id);
  return (
    <ComplianceSummaryForm
      versionId={version_id}
      needsVerification={needsVerification}
      summaryFormData={complianceData}
      taskListElements={tasklistData}
    />
  );
}
