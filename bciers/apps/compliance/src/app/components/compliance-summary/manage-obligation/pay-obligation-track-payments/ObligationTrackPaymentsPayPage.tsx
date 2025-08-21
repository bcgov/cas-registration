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
import { getObligationTasklistData } from "@/compliance/src/app/utils/getObligationTasklistData";

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
  const tasklistData = await getObligationTasklistData(
    complianceReportVersionId,
  );
  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    tasklistData,
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
      />
    </CompliancePageLayout>
  );
}
