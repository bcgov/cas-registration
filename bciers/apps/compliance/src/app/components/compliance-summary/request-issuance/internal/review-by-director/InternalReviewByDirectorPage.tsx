import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import InternalReviewByDirectorComponent from "./InternalReviewByDirectorComponent";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { redirect } from "next/navigation";

interface Props {
  compliance_summary_id: string;
}

export default async function InternalReviewByDirectorPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const pageData =
    await getRequestIssuanceComplianceSummaryData(complianceSummaryId);

  // If the analyst hasn't reviewed the credits issuance request, redirect to the review page
  if (!pageData?.analyst_suggestion) {
    redirect(
      `/compliance-summaries/${complianceSummaryId}/review-credits-issuance-request`,
    );
  }

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
    ActivePage.ReviewByDirector,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <InternalReviewByDirectorComponent
        data={pageData}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
