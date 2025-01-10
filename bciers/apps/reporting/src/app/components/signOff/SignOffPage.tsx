import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import {
  ActivePage,
  getSignOffAndSubmitSteps,
} from "@reporting/src/app/components/taskList/5_signOffSubmit";
import SignOffForm from "./SignOffForm";

export default async function SignOffPage({ version_id }: HasReportVersion) {
  const taskListElements = await getSignOffAndSubmitSteps(
    version_id,
    ActivePage.SignOff,
  );

  return (
    <SignOffForm version_id={version_id} taskListElements={taskListElements} />
  );
}
