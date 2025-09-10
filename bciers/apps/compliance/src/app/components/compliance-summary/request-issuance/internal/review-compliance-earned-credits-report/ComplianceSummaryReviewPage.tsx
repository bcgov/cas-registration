import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import ComplianceSummaryReviewComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-earned-credits-report/ComplianceSummaryReviewComponent";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";

export default async function ComplianceSummaryReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const complianceSummary = await getRequestIssuanceComplianceSummaryData(
    complianceReportVersionId,
  );
  const taskListElements = generateIssuanceRequestTaskList(
    complianceReportVersionId,
    complianceSummary.reporting_year,
    complianceSummary.issuance_status,
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
