import {
  generateReviewObligationPenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";

interface Props {
  compliance_report_version_id: number;
}

export default async function InternalPenaltySummaryReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<Props>) {
  const { reporting_year: reportingYear } = await getReportingYear();

  const taskListElements = generateReviewObligationPenaltyTaskList(
    complianceReportVersionId,
    reportingYear,
    ActivePage.ReviewPenaltySummary,
  );

  return (
    <CompliancePageLayout
      complianceReportVersionId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      TBD — task #280
    </CompliancePageLayout>
  );
}
