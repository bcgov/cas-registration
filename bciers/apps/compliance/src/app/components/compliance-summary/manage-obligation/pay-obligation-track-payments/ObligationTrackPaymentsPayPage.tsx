import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function ObligationTrackPaymentsPayPage({compliance_summary_id:complianceSummaryId}: Props) {
  // const complianceSummary = await getComplianceSummary(complianceSummaryId);
  const complianceSummary = {
    reportingYear: "2025",
  };

  const taskListElements = generateManageObligationTaskList(
    complianceSummaryId,
    complianceSummary.reportingYear,
    ActivePage.PayObligationTrackPayments,
  );

  const backUrl = `/compliance-summaries/${complianceSummaryId}/download-payment-instructions`;
  const saveAndContinueUrl = "#";

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceSummaryId={complianceSummaryId}
    >
      ObligationTrackPaymentsPay ...TBD
      <ComplianceStepButtons
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
      />
    </CompliancePageLayout>
  );
}
