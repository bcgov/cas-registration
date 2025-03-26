import {
  ActivePage,
  getComplianceSummaryTaskList,
} from "@/compliance/src/app/components/taskList/1_review2024ComplianceSummary";
import { getComplianceSummary } from "../../../utils/getComplianceSummary";
import ComplianceSummaryReviewComponent from "./ComplianceSummaryReviewComponent";

interface Props {
  compliance_summary_id: number;
}

export default async function ComplianceSummaryReviewPage({
  compliance_summary_id,
}: Props) {
  const complianceSummary = await getComplianceSummary();

  const taskListElements = getComplianceSummaryTaskList(
    compliance_summary_id,

    complianceSummary.reporting_year,
    ActivePage.ReviewComplianceSummary,
  );

  return (
    <ComplianceSummaryReviewComponent
      formData={complianceSummary}
      compliance_summary_id={compliance_summary_id}
      taskListElements={taskListElements}
    />
  );
}
