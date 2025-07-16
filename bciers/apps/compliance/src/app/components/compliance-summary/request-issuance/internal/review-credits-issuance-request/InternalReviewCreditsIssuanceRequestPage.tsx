import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import InternalReviewCreditsIssuanceRequestComponent from "./InternalReviewCreditsIssuanceRequestComponent";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { redirect } from "next/navigation";

interface Props {
  compliance_summary_id: string;
}

export default async function InternalReviewCreditsIssuanceRequestPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const pageData =
    await getRequestIssuanceComplianceSummaryData(complianceSummaryId);

  if (
    [IssuanceStatus.APPROVED, IssuanceStatus.DECLINED].includes(
      pageData.issuance_status as IssuanceStatus,
    )
  ) {
    redirect(
      `/compliance-summaries/${complianceSummaryId}/track-status-of-issuance`,
    );
  }

  const taskListElements = generateIssuanceRequestTaskList(
    complianceSummaryId,
    pageData.reporting_year,
    ActivePage.ReviewCreditsIssuanceRequest,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <InternalReviewCreditsIssuanceRequestComponent
        initialFormData={pageData}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
