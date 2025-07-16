import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import InternalTrackStatusOfIssuanceComponent from "./InternalTrackStatusOfIssuanceComponent";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { redirect } from "next/navigation";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";

interface Props {
  compliance_summary_id: string;
}

const RESTRICTED_STATUSES = [
  IssuanceStatus.CHANGES_REQUIRED,
  IssuanceStatus.ISSUANCE_REQUESTED,
];

export default async function InternalTrackStatusOfIssuancePage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  let pageData =
    await getRequestIssuanceComplianceSummaryData(complianceSummaryId);

  // Redirect to the previous page if the user is not authorized to view this page
  if (
    RESTRICTED_STATUSES.includes(pageData.issuance_status as IssuanceStatus)
  ) {
    redirect(`/compliance-summaries/${complianceSummaryId}/review-by-director`);
  }

  const taskListElements = generateIssuanceRequestTaskList(
    complianceSummaryId,
    pageData.reporting_year,
    ActivePage.TrackStatusOfIssuance,
  );
  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <InternalTrackStatusOfIssuanceComponent
        data={pageData}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
