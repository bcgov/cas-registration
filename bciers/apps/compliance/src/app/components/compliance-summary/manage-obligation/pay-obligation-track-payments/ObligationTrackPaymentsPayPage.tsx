import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { ObligationTrackPaymentsComponent } from "./ObligationTrackPaymentsComponent";
import { getComplianceReportVersion } from "@/compliance/src/app/utils/getComplianceReportVersion";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function ObligationTrackPaymentsPayPage({
  compliance_summary_id: complianceReportVersionId,
}: Props) {
  const complianceReportVersion = await getComplianceReportVersion(
    complianceReportVersionId,
  );

  // Transform the data for the component (keeping mock payment data for now)
  const complianceSummary = {
    reportingYear: complianceReportVersion.reporting_year.toString(),
    outstandingBalance:
      complianceReportVersion.outstanding_balance?.toFixed(4) || "0.0000",
    equivalentValue:
      complianceReportVersion.equivalent_value?.toFixed(2) || "0.00",
    paymentReceivedDate: "Dec 6, 2025", // Mock data
    paymentAmountReceived: "8,000.00", // Mock data
  };

  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    complianceSummary.reportingYear,
    ActivePage.PayObligationTrackPayments,
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceSummaryId={complianceReportVersionId}
    >
      <ObligationTrackPaymentsComponent
        data={complianceSummary}
        complianceSummaryId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
