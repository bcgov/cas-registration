import {
  ActivePage,
  getComplianceSummaryTaskList,
} from "@/compliance/src/app/components/taskList/1_review2024ComplianceSummary";
import ComplianceSummaryReviewComponent from "./ComplianceSummaryReviewComponent";
import { fetchComplianceSummaryReviewPageData } from "./fetchComplianceSummaryReviewPageData";

interface Props {
  compliance_summary_id: number;
}

export default async function ComplianceSummaryReviewPage(props: Props) {
  const complianceSummaryId = props.compliance_summary_id;
  const { complianceSummary, paymentsData } =
    await fetchComplianceSummaryReviewPageData(complianceSummaryId);

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
      paymentsData={paymentsData}
    />
  );
}
