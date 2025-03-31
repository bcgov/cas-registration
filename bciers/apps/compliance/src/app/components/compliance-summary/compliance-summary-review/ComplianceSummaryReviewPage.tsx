import {
  ActivePage,
  getComplianceSummaryTaskList,
} from "@/compliance/src/app/components/taskList/1_review2024ComplianceSummary";
import { getComplianceSummary } from "../../../utils/getComplianceSummary";
import ComplianceSummaryReviewComponent from "./ComplianceSummaryReviewComponent";

interface Props {
  compliance_summary_id: number;
}

export default async function ComplianceSummaryReviewPage(props: Props) {
  const complianceSummaryId = props.compliance_summary_id;

  const complianceSummary = await getComplianceSummary();
  console.log(complianceSummaryId);
  const taskListElements = getComplianceSummaryTaskList(
    complianceSummaryId,

    complianceSummary.reporting_year,
    ActivePage.ReviewComplianceSummary,
  );

  return (
    <ComplianceSummaryReviewComponent
      formData={complianceSummary}
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    />
  );
}
