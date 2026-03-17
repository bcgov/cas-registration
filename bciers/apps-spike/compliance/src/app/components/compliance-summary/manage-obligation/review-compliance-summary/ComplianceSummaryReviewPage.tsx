import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import { ComplianceSummaryReviewComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewComponent";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { fetchComplianceSummaryReviewPageData } from "@/compliance/src/app/utils/fetchComplianceSummaryReviewPageData";
import {
  ComplianceSummaryReviewPageData,
  HasComplianceReportVersion,
} from "@/compliance/src/app/types";

export default async function ComplianceSummaryReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const complianceSummaryReviewPageData: ComplianceSummaryReviewPageData =
    await fetchComplianceSummaryReviewPageData(complianceReportVersionId);
  const {
    penalty_status: penaltyStatus,
    reporting_year: reportingYear,
    outstanding_balance_tco2e: outstandingBalance,
    has_late_submission_penalty: hasLateSubmissionPenalty,
    has_overdue_penalty: hasOverduePenalty,
  } = complianceSummaryReviewPageData;

  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    {
      penaltyStatus,
      reportingYear,
      outstandingBalance,
      hasLateSubmissionPenalty,
      hasOverduePenalty,
    },
    ActivePage.ReviewComplianceSummary,
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceReportVersionId={complianceReportVersionId}
    >
      <ComplianceSummaryReviewComponent
        data={complianceSummaryReviewPageData}
        complianceReportVersionId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
