import {
  ActivePage,
  generateReviewObligationPenaltyTaskList,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import PenaltyCalculatorComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/PenaltyCalculatorComponent";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import { getPenaltyAccrualCalculationData } from "@/compliance/src/app/utils/getPenaltyAccrualCalculationData";

interface Props {
  compliance_report_version_id: number;
  searchParams?: {
    penalty_type?: string;
    final_day_of_penalty_accrual?: string;
  };
}

export default async function PenaltyCalculatorPage({
  compliance_report_version_id: complianceReportVersionId,
  searchParams,
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

  const defaultEndDate = new Date().toISOString().split("T")[0];
  const selectedPenaltyType = searchParams?.penalty_type ?? "automatic_overdue";
  const selectedFinalDay =
    searchParams?.final_day_of_penalty_accrual ?? defaultEndDate;
  const penaltyAccrualCalculationData = await getPenaltyAccrualCalculationData(
    complianceReportVersionId,
    {
      penalty_type: selectedPenaltyType,
      final_day_of_penalty_accrual: selectedFinalDay,
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
        initialPenaltyType={selectedPenaltyType}
        initialFinalDayOfPenaltyAccrual={selectedFinalDay}
      />
    </CompliancePageLayout>
  );
}
