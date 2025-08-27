import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { PenaltyTrackPaymentsComponent } from "./PenaltyTrackPaymentsComponent";
import { getPenaltyData } from "@/compliance/src/app/utils/getPenalty";
import {
  HasComplianceReportVersion,
  PayPenaltyTrackPaymentsFormData,
  PenaltyData,
} from "@/compliance/src/app/types";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

export default async function PenaltyTrackPaymentsPayPage({
  compliance_report_version_id: complianceReportVersionId,
}: HasComplianceReportVersion) {
  const penaltyWithPayments: PenaltyData = await getPenaltyData(
    complianceReportVersionId,
  );

  const data: PayPenaltyTrackPaymentsFormData = {
    ...penaltyWithPayments,
    payments: penaltyWithPayments.payment_data.rows,
  };

  const {
    penalty_status: penaltyStatus,
    reporting_year: reportingYear,
    outstanding_balance_tco2e: outstandingBalance,
  } = await getComplianceSummary(complianceReportVersionId);

  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    {
      penaltyStatus,
      reportingYear,
      outstandingBalance,
    },
    ActivePage.PayPenaltyTrackPayments,
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceReportVersionId={complianceReportVersionId}
    >
      <PenaltyTrackPaymentsComponent
        data={data}
        complianceReportVersionId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
