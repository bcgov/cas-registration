import {
  InternalActivePage,
  getInternalRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/internal/2_internalRequestIssuanceSchema";
import InternalReviewByDirectorComponent from "./InternalReviewByDirectorComponent";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { getDirectorReviewData } from "@/compliance/src/app/utils/getDirectorReviewData";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function InternalReviewByDirectorPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const directorReviewData = getDirectorReviewData(complianceSummaryId);

  const taskListElements = getInternalRequestIssuanceTaskList(
    complianceSummaryId,
    directorReviewData.reporting_year,
    InternalActivePage.DirectorReview,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <InternalReviewByDirectorComponent
        formData={directorReviewData}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
