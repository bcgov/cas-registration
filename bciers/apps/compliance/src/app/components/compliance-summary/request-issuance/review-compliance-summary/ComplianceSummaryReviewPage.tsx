import {
  ActivePage,
  getRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceSchema";
// import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import ComplianceFormHeading from "@/compliance/src/app/components/layout/ComplianceFormHeading";
import { FormReport } from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/FormReport";
import { EarnedCredits } from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/EarnedCredits";
import ComplianceStepButtons from "@bciers/components/form/components/ComplianceStepButtons";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";

interface Props {
  compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  // const complianceSummary =
  //   await getRequestIssuanceComplianceSummaryData(complianceSummaryId);

  // TODO: Remove this mock data and use the above function to fetch real data
  const complianceSummary = {
    operationId: 123,
    reportingYear: 2024,
    excessEmissions: "-15.0",
    emissionLimit: "100.0",
    emissionsAttributableForCompliance: "85.0",
    earnedCredits: 15,
    issuanceStatus: "Issuance not requested",
  };

  const taskListElements = getRequestIssuanceTaskList(
    complianceSummaryId,
    complianceSummary.reportingYear,
    ActivePage.ReviewComplianceSummary,
  );

  const backUrl = "/compliance-summaries";
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance-of-earned-credits`;

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      {/*TODO: Remove hardcoded year*/}
      <ComplianceFormHeading title="Review 2024 Compliance Summary" />
      <FormReport data={complianceSummary} />
      <EarnedCredits data={complianceSummary} />
      <ComplianceStepButtons
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
        className="mt-44"
      />
    </CompliancePageLayout>
  );
}
