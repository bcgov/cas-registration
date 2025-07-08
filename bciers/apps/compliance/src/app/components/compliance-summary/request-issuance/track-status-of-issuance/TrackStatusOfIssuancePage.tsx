import {
  generateRequestIssuanceTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import { getRequestIssuanceTrackStatusData } from "@/compliance/src/app/utils/getRequestIssuanceTrackStatusData";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import TrackStatusOfIssuanceComponent from "./TrackStatusOfIssuanceComponent";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function TrackStatusOfIssuancePage({
  compliance_summary_id: complianceReportVersionId,
}: Props) {
  const data = await getRequestIssuanceTrackStatusData(
    complianceReportVersionId,
  );
  const { reporting_year: reportingYear } = await getReportingYear();

  const taskListElements = generateRequestIssuanceTaskList(
    complianceReportVersionId,
    reportingYear,
    ActivePage.TrackStatusOfIssuance,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      <TrackStatusOfIssuanceComponent
        data={data}
        complianceSummaryId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
