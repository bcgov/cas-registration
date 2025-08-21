import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import PenaltySummaryReviewComponent from "./PenaltySummaryReviewComponent";
import getAutomaticOverduePenalty from "@/compliance/src/app/utils/getAutomaticOverduePenalty";
import { getObligationTasklistData } from "@/compliance/src/app/utils/getObligationTasklistData";
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
  const tasklistData = await getObligationTasklistData(
    complianceReportVersionId,
  );

  const taskListElements = generateManageObligationTaskList(
    complianceReportVersionId,
    tasklistData,
    ActivePage.ReviewPenaltySummary,
  );

  return (
    <CompliancePageLayout
      complianceReportVersionId={complianceReportVersionId}
      taskListElements={taskListElements}
    >
      <PenaltySummaryReviewComponent
        data={penaltyData}
        reportingYear={tasklistData.reporting_year}
        complianceReportVersionId={complianceReportVersionId}
      />
    </CompliancePageLayout>
  );
}
