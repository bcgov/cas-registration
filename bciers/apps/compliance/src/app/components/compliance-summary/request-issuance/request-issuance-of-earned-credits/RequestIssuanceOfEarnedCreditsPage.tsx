import {
  generateRequestIssuanceTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import RequestIssuanceOfEarnedCreditsComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsComponent";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";
import { getRequestIssuanceTrackStatusData } from "@/compliance/src/app/utils/getRequestIssuanceTrackStatusData";

export default async function RequestIssuanceOfEarnedCreditsPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const { reporting_year: reportingYear } = await getReportingYear();
  const earnedCreditData = await getRequestIssuanceTrackStatusData(
    complianceReportVersionId.toString(),
  );

  const taskListElements = generateRequestIssuanceTaskList(
    complianceReportVersionId,
    reportingYear,
    earnedCreditData.issuance_status,
    ActivePage.RequestIssuanceOfEarnedCredits,
  );

  return (
    <CompliancePageLayout
      complianceReportVersionId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      <RequestIssuanceOfEarnedCreditsComponent
        complianceReportVersionId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
