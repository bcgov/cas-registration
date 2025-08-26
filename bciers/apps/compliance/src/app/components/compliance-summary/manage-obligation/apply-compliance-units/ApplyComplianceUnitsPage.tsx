import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import ApplyComplianceUnitsComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/apply-compliance-units/ApplyComplianceUnitsComponent";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";

export default async function ApplyComplianceUnitsPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const {
    penalty_status: penaltyStatus,
    reporting_year: reportingYear,
    outstanding_balance: outstandingBalance,
  } = await getComplianceSummary(complianceReportVersionId);
  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    {
      penaltyStatus,
      reportingYear,
      outstandingBalance,
    },
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
