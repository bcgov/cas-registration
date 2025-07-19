import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import ApplyComplianceUnitsComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/apply-compliance-units/ApplyComplianceUnitsComponent";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";

interface Props {
  compliance_summary_id: string;
}
export default async function ApplyComplianceUnitsPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const reportingYearData = await getReportingYear();
  const taskListElements = generateManageObligationTaskList(
    complianceSummaryId,
    reportingYearData,
    ActivePage.ApplyComplianceUnits,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <ApplyComplianceUnitsComponent
        complianceSummaryId={complianceSummaryId}
        reportingYear={reportingYearData.reporting_year}
      />
    </CompliancePageLayout>
  );
}
