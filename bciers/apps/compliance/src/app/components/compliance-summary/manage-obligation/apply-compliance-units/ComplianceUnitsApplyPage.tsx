import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import ComplianceUnitsApplyComponent from "./ComplianceUnitsApplyComponent";

interface Props {
  readonly compliance_summary_id: string;
}
export default async function ComplianceUnitsApplyPage({
  compliance_summary_id: complianceSummaryId,
}: Props) {
  // const complianceUnitsData = await getComplianceUnitsApplyData();
  const complianceUnitsData = {
    reportingYear: "2025",
  };

  const taskListElements = generateManageObligationTaskList(
    complianceSummaryId,
    complianceUnitsData.reportingYear,
    ActivePage.ApplyComplianceUnits,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <ComplianceUnitsApplyComponent
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
