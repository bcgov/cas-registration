import {
  ActivePage,
  generateReviewObligationPenaltyTaskList,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import PenaltyCalculatorComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/PenaltyCalculatorComponent";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import { getPenaltyAccrualCalculationData } from "@/compliance/src/app/utils/getPenaltyAccrualCalculationData";
import { PenaltyType } from "@/compliance/src/app/types";

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

  const finalDayOfPenaltyAccrual = new Date().toISOString().split("T")[0];
  const penaltyAccrualCalculationData = await getPenaltyAccrualCalculationData(
    complianceReportVersionId,
    {
      requested_penalty_type: PenaltyType.AUTOMATIC_OVERDUE,
      end_date: finalDayOfPenaltyAccrual,
    },
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceReportVersionId={complianceReportVersionId}
    >
      <PenaltyCalculatorComponent
        complianceReportVersionId={complianceReportVersionId}
        penaltyData={penaltyAccrualCalculationData}
        finalDayOfPenaltyAccrual={finalDayOfPenaltyAccrual}
      />
    </CompliancePageLayout>
  );
}
