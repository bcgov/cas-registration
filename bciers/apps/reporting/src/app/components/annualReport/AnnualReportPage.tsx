import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getFlowWithNewCases } from "@reporting/src/app/components/taskList/reportingFlows";
import { getFinalReviewData } from "@reporting/src/app/utils/getFinalReviewData";
import ReportForm from "@reporting/src/app/components/submitted/ReportForm";
import { ReportingOrigin } from "@reporting/src/app/components/taskList/types";

export default async function AnnualReportPage({
  version_id,
}: HasReportVersion) {
  const [flow, data] = await Promise.all([
    getFlowWithNewCases(version_id),
    getFinalReviewData(version_id),
  ]);
  return (
    <ReportForm
      version_id={version_id}
      flow={flow}
      origin={ReportingOrigin.AnnualReport}
      data={data}
    />
  );
}
