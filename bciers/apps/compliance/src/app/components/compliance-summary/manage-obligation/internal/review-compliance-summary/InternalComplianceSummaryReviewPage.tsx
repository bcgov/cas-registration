import {
  ActivePage,
  generateReviewObligationPenaltyTaskList,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";
import { InternalComplianceSummaryReviewComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/InternalComplianceSummaryReviewComponent";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import {
  HasComplianceReportVersion,
  InternalComplianceSummaryReviewPageData,
} from "@/compliance/src/app/types";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";

export default async function InternalComplianceSummaryReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const [complianceSummary, appliedComplianceUnitsData] = await Promise.all([
    getComplianceSummary(complianceReportVersionId),
    getComplianceAppliedUnits(complianceReportVersionId),
  ]);

  const complianceSummaryReviewPageData: InternalComplianceSummaryReviewPageData =
    {
      ...complianceSummary,
      applied_units_summary: {
        compliance_report_version_id: complianceReportVersionId,
        applied_compliance_units: appliedComplianceUnitsData,
      },
    };

  const {
    reporting_year: reportingYear,
    has_late_submission_penalty: hasLateSubmissionPenalty,
    has_overdue_penalty: hasOverduePenalty,
    penalty_status: penaltyStatus,
    outstanding_balance_tco2e: outstandingBalance,
  } = complianceSummaryReviewPageData;

  const taskListElements = generateReviewObligationPenaltyTaskList(
    complianceReportVersionId,
    {
      reportingYear,
      penaltyStatus,
      outstandingBalance,
      hasLateSubmissionPenalty,
      hasOverduePenalty,
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
        complianceReportVersionId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
