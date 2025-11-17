import {
  ActivePage,
  generateReviewObligationPenaltyTaskList,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";
import { InternalComplianceSummaryReviewComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/InternalComplianceSummaryReviewComponent";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import {
  ComplianceSummary,
  HasComplianceReportVersion,
} from "@/compliance/src/app/types";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";

export default async function InternalComplianceSummaryReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const complianceSummaryReviewPageData: ComplianceSummary =
    await getComplianceSummary(complianceReportVersionId);
  const {
    penalty_status: penaltyStatus,
    reporting_year: reportingYear,
    outstanding_balance_tco2e: outstandingBalance,
  } = complianceSummaryReviewPageData;
  const taskListElements = generateReviewObligationPenaltyTaskList(
    complianceReportVersionId,
    {
      penaltyStatus,
      reportingYear,
      outstandingBalance,
    },
    ActivePage.ReviewComplianceObligationReport,
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceReportVersionId={complianceReportVersionId}
    >
      <InternalComplianceSummaryReviewComponent
        data={complianceSummaryReviewPageData}
      />
    </CompliancePageLayout>
  );
}
