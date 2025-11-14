import {
  generateRequestIssuanceTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import ManualHandlingReviewComponent from "@/compliance/src/app/components/compliance-summary/manual-handling/review-maual-handling/ManualHandlingReviewComponent";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import {
  HasComplianceReportVersion,
  RequestIssuanceComplianceSummaryData,
} from "@/compliance/src/app/types";

export default async function ManualHandlingReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const complianceSummary: RequestIssuanceComplianceSummaryData =
    await getRequestIssuanceComplianceSummaryData(complianceReportVersionId);

  const taskListElements = generateRequestIssuanceTaskList(
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
      <>to do</>
    </CompliancePageLayout>
  );
}
