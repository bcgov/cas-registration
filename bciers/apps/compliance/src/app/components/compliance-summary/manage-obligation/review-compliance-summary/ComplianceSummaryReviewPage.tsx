import {
  ActivePage,
  getComplianceSummaryTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationSchema";
import { getComplianceSummary } from "../../../../utils/getComplianceSummary";
import ComplianceSummaryReviewComponent from "../../manage-obligation/review-compliance-summary/ComplianceSummaryReviewComponent";

interface Props {
  compliance_summary_id: string;
}

export default async function C1omplianceSummaryReviewPage(props: Props) {
  // Convert the string ID from URL params to a number
  const complianceSummaryId = parseInt(props.compliance_summary_id, 10);

  const complianceSummary = await getComplianceSummary();
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
