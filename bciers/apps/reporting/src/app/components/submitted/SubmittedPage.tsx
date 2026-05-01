import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getFlowWithNewCases } from "@reporting/src/app/components/taskList/reportingFlows";
import { getFinalReviewData } from "@reporting/src/app/utils/getFinalReviewData";
import getAttachments from "@reporting/src/app/utils/getAttachments";
import ReportForm from "@reporting/src/app/components/submitted/ReportForm";
import { ReportingOrigin } from "@reporting/src/app/components/taskList/types";

export default async function SubmittedPage({ version_id }: HasReportVersion) {
  const [flow, data, attachmentsData] = await Promise.all([
    getFlowWithNewCases(version_id),
    getFinalReviewData(version_id),
    getAttachments(version_id),
  ]);
  return (
    <ReportForm
      version_id={version_id}
      flow={flow}
      origin={ReportingOrigin.Submitted}
      data={data}
      attachments={attachmentsData.attachments ?? []}
    />
  );
}
