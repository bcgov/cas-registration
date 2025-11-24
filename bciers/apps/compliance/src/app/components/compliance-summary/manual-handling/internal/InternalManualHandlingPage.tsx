import { generateManualHandlingTaskList } from "@/compliance/src/app/components/taskLists/internal/manualHandling";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import InternalManualHandlingComponent from "@/compliance/src/app/components/compliance-summary/manual-handling/internal/InternalManualHandlingComponent";
import { getManualHandlingData } from "@/compliance/src/app/utils/getManualHandlingData";
import {
  HasComplianceReportVersion,
  ManualHandlingData,
} from "@/compliance/src/app/types";

export default async function InternalManualHandlingPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const data: ManualHandlingData = await getManualHandlingData(
    complianceReportVersionId,
  );

  const taskListElements = generateManualHandlingTaskList(
    complianceReportVersionId,
  );

  return (
    <CompliancePageLayout
      complianceReportVersionId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      <InternalManualHandlingComponent
        initialFormData={data}
        complianceReportVersionId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
