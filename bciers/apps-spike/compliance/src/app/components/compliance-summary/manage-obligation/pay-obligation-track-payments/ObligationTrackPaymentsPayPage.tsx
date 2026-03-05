import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { ObligationTrackPaymentsComponent } from "./ObligationTrackPaymentsComponent";
import { getObligationData } from "@/compliance/src/app/utils/getObligation";
import {
  HasComplianceReportVersion,
  ObligationData,
  PayObligationTrackPaymentsFormData,
} from "@/compliance/src/app/types";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";

export default async function ObligationTrackPaymentsPayPage({
  compliance_report_version_id: complianceReportVersionId,
}: HasComplianceReportVersion) {
  const obligationWithPayments: ObligationData = await getObligationData(
    complianceReportVersionId,
  );

  const data: PayObligationTrackPaymentsFormData = {
    ...obligationWithPayments,
    payments: obligationWithPayments.payment_data.rows,
  };
  const {
    penalty_status: penaltyStatus,
    reporting_year: reportingYear,
    outstanding_balance_tco2e: outstandingBalance,
    has_late_submission_penalty: hasLateSubmissionPenalty,
    has_overdue_penalty: hasOverduePenalty,
  } = await getComplianceSummary(complianceReportVersionId);
  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    {
      penaltyStatus,
      reportingYear,
      outstandingBalance,
      hasLateSubmissionPenalty,
      hasOverduePenalty,
    },
    ActivePage.PayObligationTrackPayments,
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceReportVersionId={complianceReportVersionId}
    >
      <ObligationTrackPaymentsComponent
        data={data}
        complianceReportVersionId={complianceReportVersionId}
        outstandingBalance={outstandingBalance}
        hasLateSubmissionPenalty={hasLateSubmissionPenalty}
        penaltyStatus={penaltyStatus}
      />
    </CompliancePageLayout>
  );
}
