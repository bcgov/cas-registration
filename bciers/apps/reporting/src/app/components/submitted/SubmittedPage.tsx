import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import SubmittedForm from "./SubmittedForm";

export default async function SubmittedPage({ version_id }: HasReportVersion) {
  return <SubmittedForm version_id={version_id} />;
}
