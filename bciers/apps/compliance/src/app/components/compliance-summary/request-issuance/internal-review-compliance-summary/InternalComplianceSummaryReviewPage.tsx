import {
  InternalActivePage,
  getInternalRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/internal/2_internalRequestIssuanceSchema";

import { InternalComplianceSummaryReviewComponent } from "./InternalComplianceSummaryReviewComponent";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function InternalComplianceSummaryReviewPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const complianceSummary =
    await getRequestIssuanceComplianceSummaryData(complianceSummaryId);

  const { reporting_year: reportingYear } = await getReportingYear();

  const taskListElements = getInternalRequestIssuanceTaskList(
    complianceSummaryId,
    reportingYear,
    InternalActivePage.ReviewComplianceSummary,
  );

  return (
    <CompliancePageLayout
      taskListElements={taskListElements}
      complianceSummaryId={complianceSummaryId}
    >
      <InternalComplianceSummaryReviewComponent
        data={complianceSummary}
        complianceSummaryId={complianceSummaryId}
        reportingYear={reportingYear}
      />
    </CompliancePageLayout>
  );
}
