import {
  ActivePage,
  generateRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceTaskList";
import { getRequestIssuanceTrackStatusData } from "@/compliance/src/app/utils/getRequestIssuanceTrackStatusData";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import TrackStatusOfIssuanceComponent from "./TrackStatusOfIssuanceComponent";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function TrackStatusOfIssuancePage({
  compliance_summary_id,
}: Props) {
  const data = await getRequestIssuanceTrackStatusData();
  const { reporting_year: reportingYear } = await getReportingYear();
  const frontEndRole = await getSessionRole();
  const isCasStaff = frontEndRole.startsWith("cas_");

  const taskListElements = generateRequestIssuanceTaskList(
    compliance_summary_id,
    reportingYear,
    ActivePage.TrackStatusOfIssuance,
    isCasStaff,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={compliance_summary_id}
      taskListElements={taskListElements}
    >
      <TrackStatusOfIssuanceComponent
        data={data}
        complianceSummaryId={compliance_summary_id}
      />
    </CompliancePageLayout>
  );
}
