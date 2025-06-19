import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
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

  const taskListElements = generateIssuanceRequestTaskList(
    complianceSummaryId,
    directorReviewData.reporting_year,
    ActivePage.ReviewByDirector,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <InternalReviewByDirectorComponent
        initialFormData={directorReviewData}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
