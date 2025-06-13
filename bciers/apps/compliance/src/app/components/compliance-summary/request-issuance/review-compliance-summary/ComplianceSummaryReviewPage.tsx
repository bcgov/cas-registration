import {
  generateRequestIssuanceTaskList,
  ActivePage as IndActivePage,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import {
  generateIssuanceRequestTaskList,
  ActivePage as CasActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import ComplianceSummaryReviewComponent from "./ComplianceSummaryReviewComponent";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";

interface Props {
  compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const complianceSummary =
    await getRequestIssuanceComplianceSummaryData(complianceSummaryId);
  const frontEndRole = await getSessionRole();
  const isCasStaff = frontEndRole.startsWith("cas_");

  // Task list for industrial user
  const indTaskListElements = generateRequestIssuanceTaskList(
    complianceSummaryId,
    complianceSummary.reporting_year,
    IndActivePage.ReviewComplianceSummary,
  );
  // Task list for cas users
  const casTaskListElements = generateIssuanceRequestTaskList(
    complianceSummaryId,
    complianceSummary.reporting_year,
    CasActivePage.ReviewComplianceSummary,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={isCasStaff ? casTaskListElements : indTaskListElements}
    >
      <ComplianceSummaryReviewComponent
        complianceSummaryId={complianceSummaryId}
        data={complianceSummary}
        isCasStaff={isCasStaff}
      />
    </CompliancePageLayout>
  );
}
