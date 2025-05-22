import {
  InternalActivePage,
  getInternalRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/internal/2_internalRequestIssuanceSchema";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import { InternalRequestIssuanceReviewComponent } from "./InternalRequestIssuanceReviewComponent";

interface Props {
  readonly compliance_summary_id: string;
}

export async function InternalComplianceSummaryReviewPage(props: Props) {
  const complianceSummaryId = parseInt(props.compliance_summary_id, 10);

  // Fetch compliance summary data
  const complianceSummary =
    await getRequestIssuanceComplianceSummaryData(complianceSummaryId);

  // Generate task list elements
  const taskListElements = getInternalRequestIssuanceTaskList(
    complianceSummaryId,
    complianceSummary.reporting_year,
    InternalActivePage.ReviewComplianceSummary,
  );

  return (
    <Suspense fallback={<Loading />}>
      <InternalRequestIssuanceReviewComponent
        formData={complianceSummary}
        complianceSummaryId={complianceSummaryId}
        taskListElements={taskListElements}
      />
    </Suspense>
  );
}
