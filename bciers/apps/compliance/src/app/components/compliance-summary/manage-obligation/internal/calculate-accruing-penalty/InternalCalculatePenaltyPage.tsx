import {
  ActivePage,
  generateReviewObligationPenaltyTaskList,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";
import { InternalCalculatePenaltyComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/calculate-accruing-penalty/InternalCalculatePenaltyComponent";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import {
  ComplianceSummary,
  HasComplianceReportVersion,
} from "@/compliance/src/app/types";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import { getPenaltyAccrualCalculationData } from "@/compliance/src/app/utils/getPenaltyAccrualCalculationData";

export default async function InternalCalculatePenaltyPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const complianceSummaryReviewPageData: ComplianceSummary =
    await getComplianceSummary(complianceReportVersionId);

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
    ActivePage.CalculateAccruingPenalty,
  );

  async function calculatePenalty(
    penaltyType: string,
    endDate: string,
  ) {
    "use server";
    const params = {
      obligation_id: complianceReportVersionId,
      penalty_type: penaltyType,
      end_date: endDate,
    };
    const penaltyCalculation = await getPenaltyAccrualCalculationData(
      complianceReportVersionId,
      params,
    );
    return penaltyCalculation;
  }

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceReportVersionId={complianceReportVersionId}
    >
      <InternalCalculatePenaltyComponent
        data={complianceSummaryReviewPageData}
        complianceReportVersionId={complianceReportVersionId}
        calculatePenalty={calculatePenalty}
      />
    </CompliancePageLayout>
  );
}
