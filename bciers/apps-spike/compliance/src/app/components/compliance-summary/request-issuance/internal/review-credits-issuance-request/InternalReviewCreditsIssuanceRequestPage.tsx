import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import InternalReviewCreditsIssuanceRequestComponent from "./InternalReviewCreditsIssuanceRequestComponent";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";

export default async function InternalReviewCreditsIssuanceRequestPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const pageData = await getRequestIssuanceComplianceSummaryData(
    complianceReportVersionId,
  );

  const taskListElements = generateIssuanceRequestTaskList(
    complianceReportVersionId,
    pageData.reporting_year,
    pageData.issuance_status,
    ActivePage.ReviewCreditsIssuanceRequest,
  );

  return (
    <CompliancePageLayout
      complianceReportVersionId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      <InternalReviewCreditsIssuanceRequestComponent
        initialFormData={pageData}
        complianceReportVersionId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
