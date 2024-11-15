import { Suspense } from "react";
import { HasReportVersion } from "../../utils/defaultPageFactory";
import AttachmentsForm from "./AttachmentsForm";

const Attachments: React.FC<HasReportVersion> = ({ version_id }) => {
  return <AttachmentsForm version_id={version_id} />;
};

export default Attachments;
