import ComplianceSummaryForm from "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getComplianceSummaryTaskList } from "@reporting/src/app/components/taskList/4_complianceSummary";
import { getComplianceData } from "@reporting/src/app/utils/getComplianceData";

export default async function ComplianceSummaryPage({
  version_id,
}: HasReportVersion) {
  const complianceData = await getComplianceData(version_id);
  //🔍 Check if reports need verification
  return (
    <ComplianceSummaryForm
      versionId={version_id}
      summaryFormData={complianceData}
      taskListElements={getComplianceSummaryTaskList()}
    />
  );
}
