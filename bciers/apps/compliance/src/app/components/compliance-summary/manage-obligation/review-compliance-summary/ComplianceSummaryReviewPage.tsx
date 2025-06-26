import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import { ComplianceSummaryReviewComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewComponent";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { fetchComplianceSummaryReviewPageData } from "./fetchComplianceSummaryReviewPageData";

interface Props {
  compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage({
  compliance_summary_id: complianceReportVersionId,
}: Readonly<Props>) {
  const { complianceSummary, paymentsData } =
    await fetchComplianceSummaryReviewPageData(complianceReportVersionId);

  const transformedData = {
    complianceUnits: {
      complianceSummaryId: complianceReportVersionId,
      gridData: {
        rows: [],
        row_count: 0,
      },
    },
    monetaryPayments: {
      gridData: paymentsData,
    },
    reportingYear: complianceSummary.reporting_year.toString(),
    emissionsAttributableForCompliance:
      complianceSummary.emissions_attributable_for_compliance?.toFixed(4) ||
      "0.0000",
    emissionLimit: complianceSummary.emission_limit?.toFixed(4) || "0.0000",
    excessEmissions: complianceSummary.excess_emissions.toFixed(4),
    obligationId: complianceSummary.obligation_id || "",
    complianceChargeRate: complianceSummary.compliance_charge_rate.toFixed(2),
    equivalentValue: complianceSummary.equivalent_value.toFixed(2),
    outstandingBalance:
      complianceSummary.outstanding_balance?.toFixed(4) || "0.0000",
    outstandingBalanceEquivalentValue:
      complianceSummary.equivalent_value.toFixed(2),
    penaltyStatus: complianceSummary.penalty_status || "None",
    penaltyType: complianceSummary.penalty_type || "-",
    penaltyChargeRate:
      complianceSummary.penalty_rate_daily?.toFixed(2) || "0.00",
    daysLate: complianceSummary.days_late?.toString() || "0",
    accumulatedPenalty:
      complianceSummary.accumulated_penalty?.toFixed(2) || "0.00",
    accumulatedCompounding:
      complianceSummary.accumulated_compounding?.toFixed(2) || "0.00",
    penaltyToday: complianceSummary.penalty_today?.toFixed(2) || "0.00",
    faaInterest: complianceSummary.faa_interest?.toFixed(2) || "0.00",
    totalAmount: complianceSummary.total_amount?.toFixed(2) || "0.00",
  };

  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    transformedData.reportingYear,
    ActivePage.ReviewComplianceSummary,
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceSummaryId={complianceReportVersionId}
    >
      <ComplianceSummaryReviewComponent
        data={transformedData}
        complianceSummaryId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
