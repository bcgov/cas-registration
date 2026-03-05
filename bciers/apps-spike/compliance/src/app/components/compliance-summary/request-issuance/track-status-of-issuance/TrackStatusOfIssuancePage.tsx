import {
  generateRequestIssuanceTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import TrackStatusOfIssuanceComponent from "./TrackStatusOfIssuanceComponent";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";

export default async function TrackStatusOfIssuancePage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const pageData = await getRequestIssuanceComplianceSummaryData(
    complianceReportVersionId,
  );

  const taskListElements = generateRequestIssuanceTaskList(
    complianceReportVersionId,
    pageData.reporting_year,
    pageData.issuance_status,
    ActivePage.TrackStatusOfIssuance,
  );

  return (
    <CompliancePageLayout
      complianceReportVersionId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      <TrackStatusOfIssuanceComponent
        data={pageData}
        complianceReportVersionId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
