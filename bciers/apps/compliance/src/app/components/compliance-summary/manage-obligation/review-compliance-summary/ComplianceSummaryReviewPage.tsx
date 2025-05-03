import {
  ActivePage,
  getComplianceSummaryTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationSchema";
import { getComplianceSummary } from "../../../../utils/getComplianceSummary";
import ComplianceSummaryReviewComponent from "./ComplianceSummaryReviewComponent";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage(props: Props) {
  // Convert the string ID from URL params to a number
  const complianceSummaryId = parseInt(props.compliance_summary_id, 10);

  const complianceSummary = await getComplianceSummary(complianceSummaryId);
  const taskListElements = getComplianceSummaryTaskList(
    complianceSummaryId,
    complianceSummary.reporting_year,
    ActivePage.ReviewComplianceSummary,
  );

  return (
    <Suspense fallback={<Loading />}>
      <ComplianceSummaryReviewComponent
        formData={complianceSummary}
        complianceSummaryId={complianceSummaryId}
        taskListElements={taskListElements}
      />
    </Suspense>
  );
}
