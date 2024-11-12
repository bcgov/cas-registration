import { Suspense } from "react";
import { HasReportVersion } from "../../utils/defaultPageFactory";
import AttachmentsForm from "./AttachmentsForm";

const Attachments: React.FC<HasReportVersion> = ({ version_id }) => {
  return (
    <Suspense fallback="Loading Production Data Form">
      <AttachmentsForm version_id={version_id} />
    </Suspense>
  );
};

export default Attachments;
