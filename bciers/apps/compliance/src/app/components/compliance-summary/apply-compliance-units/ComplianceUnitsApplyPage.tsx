import {
  ActivePage,
  getComplianceSummaryTaskList,
} from "@/compliance/src/app/components/taskList/1_review2024ComplianceSummary";
import { getComplianceUnitsApplyData } from "../../../utils/getComplianceUnitsApplyData";
import ComplianceUnitsApplyComponent from "./ComplianceUnitsApplyComponent";

interface Props {
  complianceSummaryId: number;
}

export default async function ComplianceUnitsApplyPage({
  complianceSummaryId,
}: Props) {
  const complianceUnitsData = await getComplianceUnitsApplyData();

  const taskListElements = getComplianceSummaryTaskList(
    complianceSummaryId,
    complianceUnitsData.reporting_year,
    ActivePage.ApplyComplianceUnits,
  );

  return (
    <ComplianceUnitsApplyComponent
      formData={complianceUnitsData}
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    />
  );
}
