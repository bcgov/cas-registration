import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import AttachmentsForm from "./AttachmentsForm";
import getAttachments from "@reporting/src/app/utils/getAttachments";
import { UploadedAttachment } from "./types";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";

export const getDictFromAttachmentArray = (array: UploadedAttachment[]) =>
  Object.fromEntries(array.map((a) => [a.attachment_type, a]));

const AttachmentsPage: React.FC<HasReportVersion> = async ({ version_id }) => {
  const uploadedAttachments: UploadedAttachment[] =
    await getAttachments(version_id);

  const uploadedAttachmentsDict =
    getDictFromAttachmentArray(uploadedAttachments);

  //🔍 Check if reports need verification
  const needsVerification = await getReportNeedsVerification(version_id);

  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.Attachments,
    version_id,
    "",
    { skipVerification: !needsVerification },
  );

  return (
    <AttachmentsForm
      version_id={version_id}
      initialUploadedAttachments={uploadedAttachmentsDict}
      navigationInformation={navInfo}
      isVerificationStatementMandatory={needsVerification}
    />
  );
};

export default AttachmentsPage;
