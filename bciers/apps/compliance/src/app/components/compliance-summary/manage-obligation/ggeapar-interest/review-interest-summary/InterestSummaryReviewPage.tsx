import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import InterestSummaryReviewComponent from "./InterestSummaryReviewComponent";
import getLateSubmissionPenalty from "@/compliance/src/app/utils/getLateSubmissionPenalty";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import {
  generateManageObligationTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

interface Props {
  compliance_report_version_id: number;
}

export default async function InterestSummaryReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<Props>) {
  const interestData = await getLateSubmissionPenalty(
    complianceReportVersionId,
  );

  const {
    penalty_status: penaltyStatus,
    reporting_year: reportingYear,
    outstanding_balance_tco2e: outstandingBalance,
    has_late_submission_penalty: hasLateSubmissionPenalty,
  } = await getComplianceSummary(complianceReportVersionId);

  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    {
      penaltyStatus,
      reportingYear,
      outstandingBalance,
      hasLateSubmissionPenalty,
    },
    ActivePage.ReviewInterestSummary,
  );

  return (
    <CompliancePageLayout
      complianceReportVersionId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      <InterestSummaryReviewComponent
        data={interestData}
        complianceReportVersionId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
