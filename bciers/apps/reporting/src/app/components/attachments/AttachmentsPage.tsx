import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import AttachmentsForm from "./AttachmentsForm";
import getAttachments from "@reporting/src/app/utils/getAttachments";
import { UploadedAttachment } from "./types";
import { getSignOffAndSubmitSteps } from "../taskList/5_signOffSubmit";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";

export const getDictFromAttachmentArray = (array: UploadedAttachment[]) =>
  Object.fromEntries(array.map((a) => [a.attachment_type, a]));

const AttachmentsPage: React.FC<HasReportVersion> = async ({ version_id }) => {
  const uploadedAttachments: UploadedAttachment[] =
    await getAttachments(version_id);

  const uploadedAttachmentsDict =
    getDictFromAttachmentArray(uploadedAttachments);

  const taskListElements = getSignOffAndSubmitSteps(version_id, 1);

  //🔍 Check if reports need verification
  const needsVerification = await getReportNeedsVerification(version_id);

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
