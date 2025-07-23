import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import InternalTrackStatusOfIssuanceComponent from "./InternalTrackStatusOfIssuanceComponent";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { redirect } from "next/navigation";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";

const RESTRICTED_STATUSES = [
  IssuanceStatus.CHANGES_REQUIRED,
  IssuanceStatus.ISSUANCE_REQUESTED,
];

export default async function InternalTrackStatusOfIssuancePage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  let pageData = await getRequestIssuanceComplianceSummaryData(
    complianceReportVersionId,
  );

  // Redirect to the previous page if the user is not authorized to view this page
  if (
    RESTRICTED_STATUSES.includes(pageData.issuance_status as IssuanceStatus)
  ) {
    redirect(
      `/compliance-summaries/${complianceReportVersionId}/review-by-director`,
    );
  }

  // prevent internal users from accessing the page if the issuance status is CREDITS_NOT_ISSUED
  if (pageData.issuance_status === IssuanceStatus.CREDITS_NOT_ISSUED) {
    redirect(
      `/compliance-summaries/${complianceSummaryId}/request-issuance-review-summary`,
    );
  }

  const taskListElements = generateIssuanceRequestTaskList(
    complianceReportVersionId,
    pageData.reporting_year,
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
