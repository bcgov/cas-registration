import {
  generateRequestIssuanceTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import TrackStatusOfIssuanceComponent from "./TrackStatusOfIssuanceComponent";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { redirect } from "next/navigation";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";

export default async function TrackStatusOfIssuancePage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const pageData = await getRequestIssuanceComplianceSummaryData(
    complianceReportVersionId,
  );

  if (
    [
      IssuanceStatus.CREDITS_NOT_ISSUED,
      IssuanceStatus.CHANGES_REQUIRED,
    ].includes(pageData.issuance_status as IssuanceStatus)
  ) {
    redirect(
      `/compliance-summaries/${complianceReportVersionId}/request-issuance-of-earned-credits`,
    );
  }

  const taskListElements = generateRequestIssuanceTaskList(
    complianceReportVersionId,
    pageData.reporting_year,
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
