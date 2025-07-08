import {
  generateRequestIssuanceTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import TrackStatusOfIssuanceComponent from "./TrackStatusOfIssuanceComponent";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";

interface Props {
  compliance_summary_id: string;
}

export default async function TrackStatusOfIssuancePage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const pageData =
    await getRequestIssuanceComplianceSummaryData(complianceSummaryId);

  const taskListElements = generateRequestIssuanceTaskList(
    complianceSummaryId,
    pageData.reporting_year,
    ActivePage.TrackStatusOfIssuance,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <TrackStatusOfIssuanceComponent
        data={pageData}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
