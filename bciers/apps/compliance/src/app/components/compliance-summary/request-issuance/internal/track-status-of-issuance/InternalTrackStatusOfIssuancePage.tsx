import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import { getRequestIssuanceTrackStatusData } from "@/compliance/src/app/utils/getRequestIssuanceTrackStatusData";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import InternalTrackStatusOfIssuanceComponent from "./InternalTrackStatusOfIssuanceComponent";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { notFound } from "next/navigation";

interface Props {
  readonly compliance_summary_id: string;
}

const RESTRICTED_STATUSES = [
  IssuanceStatus.AWAITING_APPROVAL,
  IssuanceStatus.CHANGES_REQUIRED,
  IssuanceStatus.ISSUANCE_REQUESTED,
];

export default async function InternalTrackStatusOfIssuancePage({
  compliance_summary_id,
}: Props) {
  const data = await getRequestIssuanceTrackStatusData();

  // Redirect to not found page if accessing track status of issuance page with restricted issuance status
  if (RESTRICTED_STATUSES.includes(data.issuance_status as IssuanceStatus)) {
    notFound();
  }

  const { reporting_year: reportingYear } = await getReportingYear();
  const taskListElements = generateIssuanceRequestTaskList(
    compliance_summary_id,
    reportingYear,
    ActivePage.TrackStatusOfIssuance,
  );
  return (
    <CompliancePageLayout
      complianceSummaryId={compliance_summary_id}
      taskListElements={taskListElements}
    >
      <InternalTrackStatusOfIssuanceComponent
        data={data}
        complianceSummaryId={compliance_summary_id}
      />
    </CompliancePageLayout>
  );
}
