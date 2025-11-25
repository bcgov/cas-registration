import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { InterestPenaltyTrackPaymentsComponent } from "./InterestPenaltyTrackPaymentsComponent";
import { getLateSubmissionPenaltySummary } from "@/compliance/src/app/utils/getLateSubmissionPenaltySummary";
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

export default async function InterestPenaltyTrackPaymentsPayPage({
  compliance_report_version_id: complianceReportVersionId,
}: HasComplianceReportVersion) {
  const penaltyWithPayments: PenaltyData =
    await getLateSubmissionPenaltySummary(complianceReportVersionId);

  const data: PayPenaltyTrackPaymentsFormData = {
    ...penaltyWithPayments,
    payments: penaltyWithPayments.payment_data.rows,
  };

  const {
    penalty_status: penaltyStatus,
    reporting_year: reportingYear,
    outstanding_balance_tco2e: outstandingBalance,
    has_late_submission_penalty: hasLateSubmissionPenalty,
  } = await getComplianceSummary(complianceReportVersionId);

  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    {
      penaltyStatus,
      reportingYear,
      outstandingBalance,
      hasLateSubmissionPenalty,
    },
    ActivePage.PayInterestPenaltyTrackPayments,
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceReportVersionId={complianceReportVersionId}
    >
      <InterestPenaltyTrackPaymentsComponent
        data={data}
        complianceReportVersionId={complianceReportVersionId}
        penaltyStatus={penaltyStatus}
        outstandingBalance={outstandingBalance}
      />
    </CompliancePageLayout>
  );
}
