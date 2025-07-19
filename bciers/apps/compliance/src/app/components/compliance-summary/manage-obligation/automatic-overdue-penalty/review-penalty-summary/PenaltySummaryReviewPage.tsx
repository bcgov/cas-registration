import {
  generateAutomaticOverduePenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import PenaltySummaryReviewComponent from "./PenaltySummaryReviewComponent";
import getAutomaticOverduePenalty from "@/compliance/src/app/utils/getAutomaticOverduePenalty";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";

interface Props {
  compliance_summary_id: string;
}

export default async function PenaltySummaryReviewPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const penaltyData = await getAutomaticOverduePenalty(complianceSummaryId);
  const { reporting_year: reportingYear } = await getReportingYear();

  const taskListElements = generateAutomaticOverduePenaltyTaskList(
    complianceSummaryId,
    reportingYear,
    ActivePage.ReviewPenaltySummary,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <PenaltySummaryReviewComponent
        data={penaltyData}
        reportingYear={reportingYear}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
