import {
  ActivePage,
  generateRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceTaskList";
import { getRequestIssuanceTrackStatusData } from "@/compliance/src/app/utils/getRequestIssuanceTrackStatusData";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import TrackStatusOfIssuanceContent from "./TrackStatusOfIssuanceComponent";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function TrackStatusOfIssuancePage(props: Props) {
  const complianceSummaryId = parseInt(props.compliance_summary_id, 10);

  const data = await getRequestIssuanceTrackStatusData();
  // props.compliance_summary_id,
  const { reporting_year: reportingYear } = await getReportingYear();

  const taskListElements = generateRequestIssuanceTaskList(
    complianceSummaryId.toString(),
    reportingYear,
    ActivePage.TrackStatusOfIssuance,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={props.compliance_summary_id}
      taskListElements={taskListElements}
    >
      <TrackStatusOfIssuanceContent
        data={data}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
