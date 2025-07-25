import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import ApplyComplianceUnitsComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/apply-compliance-units/ApplyComplianceUnitsComponent";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";

export default async function ApplyComplianceUnitsPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const { reporting_year: reportingYear } = await getReportingYear();
  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    reportingYear,
    ActivePage.ApplyComplianceUnits,
  );

  return (
    <CompliancePageLayout
      complianceReportVersionId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={complianceReportVersionId}
        reportingYear={reportingYear}
      />
    </CompliancePageLayout>
  );
}
