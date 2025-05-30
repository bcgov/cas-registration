import {
  InternalActivePage,
  getInternalRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/internal/2_internalRequestIssuanceSchema";

import { InternalComplianceSummaryReviewComponent } from "./InternalComplianceSummaryReviewComponent";
import CompliancePageLayout from "../../../layout/CompliancePageLayout";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";

interface Props {
  readonly compliance_summary_id: string;
}

export async function InternalComplianceSummaryReviewPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const complianceSummary =
    await getRequestIssuanceComplianceSummaryData(complianceSummaryId);

  const taskListElements = getInternalRequestIssuanceTaskList(
    complianceSummaryId,
    complianceSummary?.reportingYear,
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
      />
    </CompliancePageLayout>
  );
}
