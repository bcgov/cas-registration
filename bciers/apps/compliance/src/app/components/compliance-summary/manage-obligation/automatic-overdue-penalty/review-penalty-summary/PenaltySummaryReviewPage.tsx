import {
  generateAutomaticOverduePenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import PenaltySummaryReviewComponent from "./PenaltySummaryReviewComponent";
import getAutomaticOverduePenalty from "@/compliance/src/app/utils/getAutomaticOverduePenalty";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";

interface Props {
  compliance_report_version_id: number;
}

export default async function PenaltySummaryReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<Props>) {
  const penaltyData = await getAutomaticOverduePenalty(
    complianceReportVersionId,
  );
  const { reporting_year: reportingYear } = await getReportingYear();

  const taskListElements = generateAutomaticOverduePenaltyTaskList(
    complianceReportVersionId,
    reportingYear,
    ActivePage.ReviewPenaltySummary,
  );

  return (
    <CompliancePageLayout
      complianceReportVersionId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      <PenaltySummaryReviewComponent
        data={penaltyData}
        reportingYear={reportingYear}
        complianceReportVersionId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
