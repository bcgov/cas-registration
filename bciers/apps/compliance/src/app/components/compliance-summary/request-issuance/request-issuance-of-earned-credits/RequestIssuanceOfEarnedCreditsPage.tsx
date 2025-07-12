import {
  generateRequestIssuanceTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import RequestIssuanceOfEarnedCreditsComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsComponent";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";

interface Props {
  compliance_summary_id: string;
}

export default async function RequestIssuanceOfEarnedCreditsPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const { reporting_year: reportingYear } = await getReportingYear();
  const taskListElements = generateRequestIssuanceTaskList(
    complianceSummaryId,
    reportingYear,
    ActivePage.RequestIssuanceOfEarnedCredits,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <RequestIssuanceOfEarnedCreditsComponent
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
