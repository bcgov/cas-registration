import {
  ActivePage,
  generateRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import ComplianceSummaryReviewComponent from "./ComplianceSummaryReviewComponent";

interface Props {
  compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  // FIXME: Replace with actual API data when backend implementation is complete
  const complianceSummary = {
    operation_name: "Compliance SFO - Obligation not met",
    reporting_year: 2023,
    emissions_attributable_for_compliance: "900.0000",
    emission_limit: "1000.0000",
    excess_emissions: "-100.0000",
    earned_credits: 100,
    issuance_status: "Awaiting Approval",
    earned_credits_issued: false,
    id: 1,
  };

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
