import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import { fetchComplianceSummaryReviewPageData } from "./fetchComplianceSummaryReviewPageData";
import { ComplianceSummaryReviewContent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewContent";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";

interface Props {
  compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  // const complianceSummary = await getComplianceSummary(complianceSummaryId);
  const complianceSummary = {
    complianceUnits: {
      complianceSummaryId,
      gridData:{
        rows: [
          {
            id: 1,
            type: "-",
            serialNumber: "-",
            vintageYear: "-",
            quantityApplied: "-",
            equivalentEmissionReduced: "-",
            equivalentValue: "-",
            status: "-",
          },
        ],
        row_count: 1,
      }
    },
    monetaryPayments:{
      gridData: {
        rows: [
          {
            id: 1,
            paymentReceivedDate: "-",
            paymentAmount: "-",
            paymentMethod: "-",
            transactionType: "-",
            referenceNumber: "-",
          },
        ],
        row_count: 1,
      }
    },
    reportingYear: "2025",
    emissionsAttributableForCompliance: "1200.0000",
    emissionLimit: "1000.0000",
    excessEmissions: "200.0000",
    obligationId: "25-0001-1-1",
    complianceChargeRate: "80.00",
    equivalentValue: "16000.00",
    outstandingBalance: "200.0000",
    outstandingBalanceEquivalentValue: "16000.00",
    penaltyStatus: "Accruing",
    penaltyType: "Automatic Overdue",
    penaltyChargeRate: "0.38",
    daysLate: "3",
    accumulatedPenalty: "91.2",
    accumulatedCompounding: "0.35",
    penaltyToday: "91.55",
    faaInterest: "0.0",
    totalAmount: "91.55",
  };

  // const { complianceSummary, paymentsData } =
  //   await fetchComplianceSummaryReviewPageData(complianceSummaryId);
  const taskListElements = generateManageObligationTaskList(
    complianceSummaryId,
    complianceSummary.reportingYear,
    ActivePage.ReviewComplianceSummary,
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceSummaryId={complianceSummaryId}
    >
      <ComplianceSummaryReviewContent
        data={complianceSummary}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
