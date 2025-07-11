import {
  generateRequestIssuanceTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import TrackStatusOfIssuanceComponent from "./TrackStatusOfIssuanceComponent";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { redirect } from "next/navigation";

interface Props {
  compliance_summary_id: string;
}

export default async function TrackStatusOfIssuancePage({
  compliance_summary_id: complianceSummaryId,
}: Readonly<Props>) {
  const pageData =
    await getRequestIssuanceComplianceSummaryData(complianceSummaryId);

  if (
    [
      IssuanceStatus.CREDITS_NOT_ISSUED,
      IssuanceStatus.CHANGES_REQUIRED,
    ].includes(pageData.issuance_status as IssuanceStatus)
  ) {
    redirect(
      `/compliance-summaries/${complianceSummaryId}/request-issuance-of-earned-credits`,
    );
  }

  const taskListElements = generateRequestIssuanceTaskList(
    complianceSummaryId,
    pageData.reporting_year,
    ActivePage.TrackStatusOfIssuance,
  );

  return (
    <CompliancePageLayout
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    >
      <TrackStatusOfIssuanceComponent
        data={pageData}
        complianceSummaryId={complianceSummaryId}
      />
    </CompliancePageLayout>
  );
}
