import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import InternalTrackStatusOfIssuanceComponent from "./InternalTrackStatusOfIssuanceComponent";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";

export default async function InternalTrackStatusOfIssuancePage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  let pageData = await getRequestIssuanceComplianceSummaryData(
    complianceReportVersionId,
  );

  const taskListElements = generateIssuanceRequestTaskList(
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
      <InternalTrackStatusOfIssuanceComponent
        data={pageData}
        complianceReportVersionId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
