import {
  generateRequestIssuanceTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import RequestIssuanceOfEarnedCreditsComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsComponent";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { redirect } from "next/navigation";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";

export default async function RequestIssuanceOfEarnedCreditsPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const { reporting_year: reportingYear } = await getReportingYear();
  const requestIssuanceComplianceSummaryData =
    await getRequestIssuanceComplianceSummaryData(complianceReportVersionId);

  // Redirect to track status of issuance page if issuance status is already set
  if (
    [
      IssuanceStatus.ISSUANCE_REQUESTED,
      IssuanceStatus.APPROVED,
      IssuanceStatus.DECLINED,
    ].includes(
      requestIssuanceComplianceSummaryData.issuance_status as IssuanceStatus,
    )
  ) {
    redirect(
      `/compliance-summaries/${complianceReportVersionId}/track-status-of-issuance`,
    );
  }

  const taskListElements = generateRequestIssuanceTaskList(
    complianceReportVersionId,
    reportingYear,
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
