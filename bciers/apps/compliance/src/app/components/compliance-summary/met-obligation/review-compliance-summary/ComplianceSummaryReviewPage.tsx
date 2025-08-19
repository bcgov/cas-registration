import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  ComplianceSummaryReviewPageData,
  HasComplianceReportVersion,
} from "@/compliance/src/app/types";
import { fetchComplianceSummaryReviewPageData } from "@/compliance/src/app/utils/fetchComplianceSummaryReviewPageData";

import ComplianceSummaryReviewComponent from "./ComplianceSummaryReviewComponent";

export default async function ComplianceSummaryReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) {
  const data: ComplianceSummaryReviewPageData =
    await fetchComplianceSummaryReviewPageData(complianceReportVersionId);

  const taskListElements: TaskListElement[] = [
    {
      type: "Section",
      title: `${data.reporting_year} Compliance Summary`,
      isExpanded: true,
      elements: [
        {
          type: "Page" as const,
          title: `Review ${data.reporting_year} Obligation Summary`,
          link: `/compliance-summaries/${complianceReportVersionId}/review-obligation-summary`,
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
