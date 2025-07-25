import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { redirect } from "next/navigation";
import ComplianceSummaryReviewComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/ComplianceSummaryReviewComponent";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";

export default async function ComplianceSummaryReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const complianceSummary = await getRequestIssuanceComplianceSummaryData(
    complianceReportVersionId,
  );

  // Redirect the user to track status page if user already requested issuance or issuance is approved or declined
  if (
    [IssuanceStatus.APPROVED, IssuanceStatus.DECLINED].includes(
      complianceSummary.issuance_status,
    )
  ) {
    redirect(
      `/compliance-summaries/${complianceReportVersionId}/track-status-of-issuance`,
    );
  }

  const taskListElements = generateIssuanceRequestTaskList(
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
