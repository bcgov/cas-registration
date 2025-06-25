import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import { ComplianceSummaryReviewComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewComponent";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
interface Props {
  compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  // TODO: Replace with actual data fetching logic post-refactoring #188 (use a single API call rather than multiple)
  // const { complianceSummary, paymentsData } = await fetchComplianceSummaryReviewPageData(complianceSummaryId);
  const appliedComplianceUnitsData =
    await getComplianceAppliedUnits(complianceSummaryId);
  const complianceSummaryData = {
    applied_compliance_units: {
      complianceSummaryId,
      appliedComplianceUnits: appliedComplianceUnitsData,
    },
    monetary_payments: {
      gridData: {
        rows: [
          {
            id: 1,
            received_date: "-",
            amount: "-",
            payment_method: "-",
            transaction_type: "-",
            payment_object_id: "-",
          },
        ],
        row_count: 1,
      },
    },
    reporting_year: "2025",
    emissions_attributable_for_compliance: "1200.0000",
    emission_limit: "1000.0000",
    excess_emissions: "200.0000",
    obligation_id: "25-0001-1-1",
    compliance_charge_rate: "80.00",
    equivalent_value: "16000.00",
    outstanding_balance: "200.0000",
    outstanding_balance_equivalent_value: "16000.00",
    penalty_status: "Accruing",
    penalty_type: "Automatic Overdue",
    penalty_charge_rate: "0.38",
    days_late: "3",
    accumulated_penalty: "91.2",
    accumulated_compounding: "0.35",
    penalty_today: "91.55",
    faa_interest: "0.0",
    total_amount: "91.55",
  };

  const taskListElements = generateManageObligationTaskList(
    complianceSummaryId,
    complianceSummaryData.reporting_year,
    ActivePage.ReviewComplianceSummary,
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceSummaryId={complianceSummaryId}
    >
      <ComplianceSummaryReviewComponent
        data={complianceSummaryData}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
