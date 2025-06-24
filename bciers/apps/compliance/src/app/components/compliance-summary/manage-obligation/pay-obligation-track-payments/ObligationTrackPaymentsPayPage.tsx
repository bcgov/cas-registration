import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { ObligationTrackPaymentsComponent } from "./ObligationTrackPaymentsComponent";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function ObligationTrackPaymentsPayPage({
  compliance_summary_id: complianceSummaryId,
}: Props) {
  // Mock data - replace with actual API call later
  const complianceSummary = {
    reportingYear: "2024",
    outstandingBalance: "0.00",
    equivalentValue: "0.00",
    paymentReceivedDate: "Dec 6, 2025",
    paymentAmountReceived: "8,000.00",
  };

  const taskListElements = generateManageObligationTaskList(
    complianceSummaryId,
    complianceSummary.reportingYear,
    ActivePage.PayObligationTrackPayments,
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceSummaryId={complianceSummaryId}
    >
      <ObligationTrackPaymentsComponent
        data={complianceSummary}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
