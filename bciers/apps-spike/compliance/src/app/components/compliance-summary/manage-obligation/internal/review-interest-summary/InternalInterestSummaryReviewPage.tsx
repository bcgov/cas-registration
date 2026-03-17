import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import InternalInterestSummaryReviewComponent from "./InternalInterestSummaryReviewComponent";
import getLateSubmissionPenalty from "@/compliance/src/app/utils/getLateSubmissionPenalty";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import {
  ActivePage,
  generateReviewObligationPenaltyTaskList,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";

interface Props {
  compliance_report_version_id: number;
}

export default async function InternalInterestSummaryReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<Props>) {
  const interestData = await getLateSubmissionPenalty(
    complianceReportVersionId,
  );
  const {
    reporting_year: reportingYear,
    has_late_submission_penalty: hasLateSubmissionPenalty,
    penalty_status: penaltyStatus,
    outstanding_balance_tco2e: outstandingBalance,
    has_overdue_penalty: hasOverduePenalty,
  } = await getComplianceSummary(complianceReportVersionId);

  const taskListElements = generateReviewObligationPenaltyTaskList(
    complianceReportVersionId,
    {
      reportingYear,
      penaltyStatus,
      outstandingBalance,
      hasLateSubmissionPenalty,
      hasOverduePenalty,
    },
    ActivePage.ReviewInterestSummary,
  );

  return (
    <CompliancePageLayout
      complianceReportVersionId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      <InternalInterestSummaryReviewComponent
        data={interestData}
        complianceReportVersionId={complianceReportVersionId}
        penaltyStatus={penaltyStatus}
        outstandingBalance={outstandingBalance}
      />
    </CompliancePageLayout>
  );
}
