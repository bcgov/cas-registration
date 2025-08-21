import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { PenaltyTrackPaymentsComponent } from "./PenaltyTrackPaymentsComponent";
import { getPenaltyData } from "@/compliance/src/app/utils/getPenalty";
import {
  HasComplianceReportVersion,
  PayPenaltyTrackPaymentsFormData,
  PenaltyData,
} from "@/compliance/src/app/types";
import { getObligationTasklistData } from "@/compliance/src/app/utils/getObligationTasklistData";
import {
  ActivePage,
  generateManageObligationTaskList,
} from "../../../../taskLists/1_manageObligationTaskList";

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

  const tasklistData = await getObligationTasklistData(
    complianceReportVersionId,
  );

  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    tasklistData,
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
