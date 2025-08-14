import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import ComplianceSummaryReviewComponent from "./ComplianceSummaryReviewComponent";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import { HasComplianceReportVersion } from "@/compliance/src/app/types";

export default async function ComplianceSummaryReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const complianceSummary = await getComplianceSummary(
    complianceReportVersionId,
  );
  const data = {
    reporting_year: complianceSummary.reporting_year,
    emissions_limit: complianceSummary.emissions_limit?.toString() ?? "",
    excess_emissions: complianceSummary.excess_emissions,
    cumulative_emissions_attributable_for_compliance:
      complianceSummary.cumulative_emissions_attributable_for_compliance?.toString() ??
      "",
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
          link: `/compliance-summaries/${complianceReportVersionId}/review-summary`,
          isActive: true,
        },
      ],
    },
  ];

  return (
    <CompliancePageLayout
      complianceReportVersionId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      <ComplianceSummaryReviewComponent data={data} />
    </CompliancePageLayout>
  );
}
