import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import PenaltySummaryReviewComponent from "./PenaltySummaryReviewComponent";
import getAutomaticOverduePenalty from "@/compliance/src/app/utils/getAutomaticOverduePenalty";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import {
  ActivePage,
  generateManageObligationTaskList,
} from "../../../../taskLists/1_manageObligationTaskList";

interface Props {
  compliance_report_version_id: number;
}

export default async function PenaltySummaryReviewPage({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<Props>) {
  const penaltyData = await getAutomaticOverduePenalty(
    complianceReportVersionId,
  );
  const {
    penalty_status: penaltyStatus,
    reporting_year: reportingYear,
    outstanding_balance: outstandingBalance,
  } = await getComplianceSummary(complianceReportVersionId);

  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    {
      penaltyStatus,
      reportingYear,
      outstandingBalance,
    },
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
