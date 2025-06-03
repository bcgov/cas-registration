import {
  ActivePage,
  generateRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import ComplianceSummaryReviewComponent from "./ComplianceSummaryReviewComponent";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";

interface Props {
  compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const complianceSummary =
    await getRequestIssuanceComplianceSummaryData(complianceSummaryId);

  const taskListElements = generateRequestIssuanceTaskList(
    complianceSummaryId,
    complianceSummary.reporting_year,
    ActivePage.ReviewComplianceSummary,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <ComplianceSummaryReviewComponent
        complianceSummaryId={complianceSummaryId}
        data={complianceSummary}
      />
    </CompliancePageLayout>
  );
}
