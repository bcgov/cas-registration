import {
  generateRequestIssuanceTaskList,
  ActivePage as ExternalActivePage,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import {
  generateIssuanceRequestTaskList,
  ActivePage as InternalActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import ComplianceSummaryReviewComponent from "./ComplianceSummaryReviewComponent";
import { fetchComplianceSummaryReviewPageData } from "@/compliance/src/app/utils/fetchComplianceSummaryReviewPageData";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";

interface Props {
  compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const frontEndRole = await getSessionRole();
  const isCasStaff = frontEndRole.startsWith("cas_");

  const complianceSummary =
    await fetchComplianceSummaryReviewPageData(complianceSummaryId);
  const externalTaskListElements = generateRequestIssuanceTaskList(
    complianceSummaryId,
    complianceSummary.reporting_year,
    ExternalActivePage.ReviewComplianceSummary,
  );
  const internalTaskListElements = generateIssuanceRequestTaskList(
    complianceSummaryId,
    complianceSummary.reporting_year,
    InternalActivePage.ReviewComplianceSummary,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={
        isCasStaff ? internalTaskListElements : externalTaskListElements
      }
    >
      <ComplianceSummaryReviewComponent
        complianceSummaryId={complianceSummaryId}
        data={complianceSummary}
        isCasStaff={isCasStaff}
      />
    </CompliancePageLayout>
  );
}
