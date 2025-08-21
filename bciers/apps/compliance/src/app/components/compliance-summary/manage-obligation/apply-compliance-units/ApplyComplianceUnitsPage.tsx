import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import ApplyComplianceUnitsComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/apply-compliance-units/ApplyComplianceUnitsComponent";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";
import { getObligationTasklistData } from "@/compliance/src/app/utils/getObligationTasklistData";

export default async function ApplyComplianceUnitsPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const tasklistData = await getObligationTasklistData(
    complianceReportVersionId,
  );
  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    tasklistData,
    ActivePage.ApplyComplianceUnits,
  );

  return (
    <CompliancePageLayout
      complianceReportVersionId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={complianceReportVersionId}
        reportingYear={tasklistData.reporting_year}
      />
    </CompliancePageLayout>
  );
}
