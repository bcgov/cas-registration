import {
  ActivePage,
  getRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceSchema";
import ComplianceFormHeading from "@/compliance/src/app/components/layout/ComplianceFormHeading";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import RequestIssuanceOfEarnedCreditsComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsComponent";

interface Props {
  compliance_summary_id: string;
}

export default async function RequestIssuanceOfEarnedCreditsPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const taskListElements = getRequestIssuanceTaskList(
    complianceSummaryId,
    2024,
    ActivePage.RequestIssuanceOfEarnedCredits,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <ComplianceFormHeading title="Request Issuance of Earned Credits" />
      <RequestIssuanceOfEarnedCreditsComponent
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
