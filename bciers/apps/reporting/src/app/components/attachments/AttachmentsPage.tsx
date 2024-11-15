import { HasReportVersion } from "../../utils/defaultPageFactory";
import AttachmentsForm from "./AttachmentsForm";
import getAttachments from "@bciers/actions/api/getAttachments";
import { UploadedAttachment } from "./types";

const AttachmentsPage: React.FC<HasReportVersion> = async ({ version_id }) => {
  const uploaded_attachments: UploadedAttachment[] =
    await getAttachments(version_id);
  console.log("!~!!!!@@~~~~~~~~~~~~~~~~~~~~~~~~```", uploaded_attachments);
  const uploaded_attachments_dict = Object.fromEntries(
    uploaded_attachments.map((a) => [a.attachment_type, a]),
  );
  return (
    <AttachmentsForm
      version_id={version_id}
      uploaded_attachments={uploaded_attachments_dict}
    />
  );
};

export default AttachmentsPage;
