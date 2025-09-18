import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import SubmittedForm from "./SubmittedForm";
import { getFlowWithNewCases } from "@reporting/src/app/components/taskList/reportingFlows";

export default async function SubmittedPage({ version_id }: HasReportVersion) {
  const flow = await getFlowWithNewCases(version_id);
  return <SubmittedForm version_id={version_id} flow={flow} />;
}
