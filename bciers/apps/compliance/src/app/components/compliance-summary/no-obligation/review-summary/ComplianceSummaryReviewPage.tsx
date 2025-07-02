import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import ComplianceSummaryReviewComponent from "./ComplianceSummaryReviewComponent";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";

interface Props {
  compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const complianceSummary = await getComplianceSummary(complianceSummaryId);
  const data = {
    reporting_year: complianceSummary.reporting_year,
    emissions_attributable_for_compliance:
      complianceSummary.emissions_attributable_for_compliance.toString(),
    emission_limit: complianceSummary.emission_limit.toString(),
    excess_emissions: complianceSummary.excess_emissions,
  };

  const taskListElements: TaskListElement[] = [
    {
      type: "Section",
      title: `${complianceSummary.reporting_year} Compliance Summary`,
      isExpanded: true,
      elements: [
        {
          type: "Page" as const,
          title: `Review ${complianceSummary.reporting_year} Compliance Summary`,
          link: `/compliance-summaries/${complianceSummaryId}/review-summary`,
          isActive: true,
        },
      ],
    },
  ];

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <ComplianceSummaryReviewComponent data={data} />
    </CompliancePageLayout>
  );
}
