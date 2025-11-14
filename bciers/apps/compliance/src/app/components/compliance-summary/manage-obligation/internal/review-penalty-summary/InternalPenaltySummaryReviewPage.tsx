import {
  generateReviewObligationPenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import getAutomaticOverduePenalty from "@/compliance/src/app/utils/getAutomaticOverduePenalty";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import PenaltySummaryReviewComponent from "../../automatic-overdue-penalty/review-penalty-summary/PenaltySummaryReviewComponent";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";

interface Props {
  compliance_report_version_id: number;
}

export default async function InternalPenaltySummaryReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<Props>) {
  // const { reporting_year: reportingYear } = await getReportingYear();
  const penaltyData = await getAutomaticOverduePenalty(
    complianceReportVersionId,
  );
  const {
    penalty_status: penaltyStatus,
    reporting_year: reportingYear,
    outstanding_balance_tco2e: outstandingBalance,
  } = await getComplianceSummary(complianceReportVersionId);
  const taskListElements = generateReviewObligationPenaltyTaskList(
    complianceReportVersionId,
    {
      penaltyStatus,
      reportingYear,
      outstandingBalance,
    },
    ActivePage.ReviewPenaltySummary,
  );

  return (
    <CompliancePageLayout
      complianceReportVersionId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      <PenaltySummaryReviewComponent
        data={penaltyData}
        reportingYear={reportingYear}
        complianceReportVersionId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
