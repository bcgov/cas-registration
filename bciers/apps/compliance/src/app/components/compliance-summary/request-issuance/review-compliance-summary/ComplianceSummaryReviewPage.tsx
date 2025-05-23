import {
  ActivePage,
  generateRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceTaskList";
// import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import ComplianceSummaryReviewComponent from "./ComplianceSummaryReviewComponent";

interface Props {
  compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  // const complianceSummary =
  //   await getRequestIssuanceComplianceSummaryData(complianceSummaryId);

  // TODO: Remove this mock data and use the above function to fetch real data
  const complianceSummaryData = {
    operationId: 123,
    reportingYear: 2024,
    excessEmissions: "-15.0",
    emissionLimit: "100.0",
    emissionsAttributableForCompliance: "85.0",
    earnedCredits: 15,
    issuanceStatus: "Issuance not requested",
  };

  const taskListElements = generateRequestIssuanceTaskList(
    complianceSummaryId,
    complianceSummaryData.reportingYear,
    ActivePage.ReviewComplianceSummary,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <ComplianceSummaryReviewComponent
        complianceSummaryId={complianceSummaryId}
        data={complianceSummaryData}
      />
    </CompliancePageLayout>
  );
}
