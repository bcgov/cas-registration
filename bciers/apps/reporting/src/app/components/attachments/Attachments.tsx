import { Suspense } from "react";
import { HasReportVersion } from "../../utils/defaultPageFactory";

const Attachments: React.FC<HasReportVersion> = ({ version_id }) => {
  return (
    <Suspense fallback="Loading Production Data Form">
      Attachments for version ID {version_id}
    </Suspense>
  );
};

export default Attachments;
