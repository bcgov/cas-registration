import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import AttachmentsForm from "./AttachmentsForm";
import getAttachments from "@reporting/src/app/utils/getAttachments";
import { UploadedAttachment } from "./types";
import {
  ActivePage,
  getSignOffAndSubmitSteps,
} from "@reporting/src/app/components/taskList/5_signOffSubmit";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";

export const getDictFromAttachmentArray = (array: UploadedAttachment[]) =>
  Object.fromEntries(array.map((a) => [a.attachment_type, a]));

const AttachmentsPage: React.FC<HasReportVersion> = async ({ version_id }) => {
  //🔍 Check if reports need verification - throws error for invalid version_id
  const needsVerification = await getReportNeedsVerification(version_id);

  const uploadedAttachments: UploadedAttachment[] =
    await getAttachments(version_id);

  const uploadedAttachmentsDict =
    getDictFromAttachmentArray(uploadedAttachments);
  const taskListElements = await getSignOffAndSubmitSteps(
    version_id,
    ActivePage.Attachments,
    needsVerification,
  );

  return (
    <AttachmentsForm
      version_id={version_id}
      initialUploadedAttachments={uploadedAttachmentsDict}
      taskListElements={taskListElements}
      isVerificationStatementMandatory={needsVerification}
    />
  );
};

export default AttachmentsPage;
