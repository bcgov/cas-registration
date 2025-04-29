import {
  ActivePage,
  getRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceSchema";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import RequestIssuanceReviewComponent from "./RequestIssuanceReviewComponent";

interface Props {
  readonly compliance_summary_id: string;
}

export default async function ComplianceSummaryReviewPage(props: Props) {
  const complianceSummaryId = parseInt(props.compliance_summary_id, 10);

  const complianceSummary = await getRequestIssuanceComplianceSummaryData(
    props.compliance_summary_id,
  );

  const taskListElements = getRequestIssuanceTaskList(
    complianceSummaryId,
    2024,
    ActivePage.ReviewComplianceSummary,
  );

  return (
    <RequestIssuanceReviewComponent
      formData={complianceSummary}
      complianceSummaryId={complianceSummaryId}
      taskListElements={taskListElements}
    />
  );
}
