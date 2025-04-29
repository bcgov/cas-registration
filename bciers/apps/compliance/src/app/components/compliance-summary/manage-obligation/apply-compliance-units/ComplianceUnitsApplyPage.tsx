import {
  ActivePage,
  getComplianceSummaryTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationSchema";
import { getComplianceUnitsApplyData } from "@/compliance/src/app/utils/getComplianceUnitsApplyData";
import ComplianceUnitsApplyComponent from "./ComplianceUnitsApplyComponent";

interface Props {
  compliance_summary_id: number;
}
export default async function ComplianceUnitsApplyPage(props: Props) {
  const complianceSummaryId = props.compliance_summary_id;

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
