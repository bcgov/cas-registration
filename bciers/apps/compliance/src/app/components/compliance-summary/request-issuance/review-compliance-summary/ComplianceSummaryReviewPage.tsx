import {
  ActivePage,
  getRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceSchema";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import RequestIssuanceReviewComponent from "./RequestIssuanceReviewComponent";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage(props: Props) {
  const complianceSummaryId = parseInt(props.compliance_summary_id, 10);

  const complianceSummary =
    await getRequestIssuanceComplianceSummaryData(complianceSummaryId);

  const taskListElements = getRequestIssuanceTaskList(
    complianceSummaryId,
    complianceSummary.reporting_year,
    ActivePage.ReviewComplianceSummary,
  );

  return (
    <Suspense fallback={<Loading />}>
      <RequestIssuanceReviewComponent
        formData={complianceSummary}
        complianceSummaryId={complianceSummaryId}
        taskListElements={taskListElements}
      />
    </Suspense>
  );
}
