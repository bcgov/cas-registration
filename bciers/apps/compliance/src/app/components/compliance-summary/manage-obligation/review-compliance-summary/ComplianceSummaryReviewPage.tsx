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

  const penaltyStatus = complianceSummaryReviewPageData.penalty_status;
  const reportingYear = complianceSummaryReviewPageData.reporting_year;
  const outstandingBalance =
    complianceSummaryReviewPageData.outstanding_balance_tco2e;

  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    {
      penaltyStatus,
      reportingYear,
      outstandingBalance,
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
