import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getFlowWithNewCases } from "@reporting/src/app/components/taskList/reportingFlows";
import ReportForm from "@reporting/src/app/components/submitted/ReportForm";

export default async function AnnualReportPage({
  version_id,
}: HasReportVersion) {
  const flow = await getFlowWithNewCases(version_id);
  return (
    <ReportForm version_id={version_id} flow={flow} origin="annual-report" />
  );
}
