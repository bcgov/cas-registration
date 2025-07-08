import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import { ComplianceSummaryReviewComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewComponent";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { fetchComplianceSummaryReviewPageData } from "@/compliance/src/app/utils/fetchComplianceSummaryReviewPageData";
import { ComplianceSummaryReviewPageData } from "@/compliance/src/app/types";

interface Props {
  compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage({
  compliance_summary_id: complianceReportVersionId,
}: Readonly<Props>) {
  const complianceSummaryData: ComplianceSummaryReviewPageData =
    await fetchComplianceSummaryReviewPageData(complianceReportVersionId);
  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    complianceSummaryData.reporting_year,
    ActivePage.ReviewComplianceSummary,
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceSummaryId={complianceReportVersionId}
    >
      <ComplianceSummaryReviewComponent
        data={complianceSummaryData}
        complianceSummaryId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
