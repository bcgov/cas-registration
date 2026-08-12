import {
  ActivePage,
  generateReviewObligationPenaltyTaskList,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import PenaltyCalculatorComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-penalty-summary/PenaltyCalculatorComponent";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";

interface Props {
  compliance_report_version_id: number;
}

export default async function PenaltyCalculatorPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<Props>) {
  const {
    reporting_year: reportingYear,
    penalty_status: penaltyStatus,
    outstanding_balance_tco2e: outstandingBalance,
    has_late_submission_penalty: hasLateSubmissionPenalty,
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
    ActivePage.PenaltyCalculator,
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceReportVersionId={complianceReportVersionId}
    >
      <PenaltyCalculatorComponent
        complianceReportVersionId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
