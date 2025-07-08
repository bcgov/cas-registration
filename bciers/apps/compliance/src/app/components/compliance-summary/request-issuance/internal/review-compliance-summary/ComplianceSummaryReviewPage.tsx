import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import ComplianceSummaryReviewComponent from "./ComplianceSummaryReviewComponent";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { redirect } from "next/navigation";

interface Props {
  compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const complianceSummary =
    await getRequestIssuanceComplianceSummaryData(complianceSummaryId);

  // Redirect the user to track status page if user already requested issuance or issuance is approved or declined
  if (
    [IssuanceStatus.APPROVED, IssuanceStatus.DECLINED].includes(
      complianceSummary.issuance_status,
    )
  ) {
    redirect(
      `/compliance-summaries/${complianceSummaryId}/track-status-of-issuance`,
    );
  }

  const taskListElements = generateIssuanceRequestTaskList(
    complianceSummaryId,
    complianceSummary.reporting_year,
    ActivePage.ReviewComplianceSummary,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <ComplianceSummaryReviewComponent
        complianceSummaryId={complianceSummaryId}
        data={complianceSummary}
      />
    </CompliancePageLayout>
  );
}
