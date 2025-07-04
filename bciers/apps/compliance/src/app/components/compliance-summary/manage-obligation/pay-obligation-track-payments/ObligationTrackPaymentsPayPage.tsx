import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { ObligationTrackPaymentsComponent } from "./ObligationTrackPaymentsComponent";
import { getComplianceSummaryPayments } from "@/compliance/src/app/utils/getComplianceSummaryPayments";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { PaymentsData } from "@/compliance/src/app/types";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function ObligationTrackPaymentsPayPage({
  compliance_summary_id: complianceSummaryId,
}: Props) {
  const { reporting_year: reportingYear } = await getReportingYear();
  const complianceSummary: PaymentsData =
    await getComplianceSummaryPayments(complianceSummaryId);

  const taskListElements = generateManageObligationTaskList(
    complianceSummaryId,
    reportingYear,
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
