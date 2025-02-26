import ComplianceSummaryForm from "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getComplianceSummaryTaskList } from "@reporting/src/app/components/taskList/4_complianceSummary";
import { getComplianceData } from "@reporting/src/app/utils/getComplianceData";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";

export default async function ComplianceSummaryPage({
  version_id,
}: HasReportVersion) {
  const complianceData = await getComplianceData(version_id);
  const facilityReport = await getFacilityReport(version_id);
  return (
    <ComplianceSummaryForm
      versionId={version_id}
      summaryFormData={complianceData}
      taskListElements={getComplianceSummaryTaskList()}
      operationType={facilityReport?.operation_type}
    />
  );
}
