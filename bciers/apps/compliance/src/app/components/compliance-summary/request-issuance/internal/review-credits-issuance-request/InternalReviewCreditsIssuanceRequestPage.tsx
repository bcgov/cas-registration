import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import InternalReviewCreditsIssuanceRequestComponent from "./InternalReviewCreditsIssuanceRequestComponent";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { getCreditsIssuanceRequestData } from "@/compliance/src/app/utils/getCreditsIssuanceRequestData";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function InternalReviewCreditsIssuanceRequestPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const complianceSummary =
    await getCreditsIssuanceRequestData(complianceSummaryId);

  const taskListElements = generateIssuanceRequestTaskList(
    complianceSummaryId,
    complianceSummary.reporting_year,
    ActivePage.ReviewCreditsIssuanceRequest,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <InternalReviewCreditsIssuanceRequestComponent
        formData={complianceSummary}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
