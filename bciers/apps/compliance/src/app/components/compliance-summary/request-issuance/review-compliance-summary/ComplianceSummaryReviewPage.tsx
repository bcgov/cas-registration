import {
  generateRequestIssuanceTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import ComplianceSummaryReviewComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/ComplianceSummaryReviewComponent";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import {
  HasComplianceReportVersion,
  RequestIssuanceComplianceSummaryData,
} from "@/compliance/src/app/types";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { redirect } from "next/navigation";

export default async function ComplianceSummaryReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const complianceSummary: RequestIssuanceComplianceSummaryData =
    await getRequestIssuanceComplianceSummaryData(complianceReportVersionId);

  // Redirect the user to track status page if user already requested issuance or issuance is approved or declined
  if (
    [
      IssuanceStatus.ISSUANCE_REQUESTED,
      IssuanceStatus.APPROVED,
      IssuanceStatus.DECLINED,
    ].includes(complianceSummary.issuance_status as IssuanceStatus)
  ) {
    redirect(
      `/compliance-summaries/${complianceReportVersionId}/track-status-of-issuance`,
    );
  }

  const taskListElements = generateRequestIssuanceTaskList(
    complianceReportVersionId,
    complianceSummary.reporting_year,
    ActivePage.ReviewComplianceSummary,
  );

  return (
    <CompliancePageLayout
      complianceReportVersionId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      <ComplianceSummaryReviewComponent
        complianceReportVersionId={complianceReportVersionId}
        data={complianceSummary}
      />
    </CompliancePageLayout>
  );
}
