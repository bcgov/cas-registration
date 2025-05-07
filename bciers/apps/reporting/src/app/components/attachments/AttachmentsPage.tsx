import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import getAttachments from "@reporting/src/app/utils/getAttachments";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components//taskList/types";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import AttachmentsForm from "./AttachmentsForm";
import { UploadedAttachment } from "./types";

export const getDictFromAttachmentArray = (array: UploadedAttachment[]) =>
  Object.fromEntries(array.map((a) => [a.attachment_type, a]));

const AttachmentsPage: React.FC<HasReportVersion> = async ({ version_id }) => {
  // Get attachment form data
  const getAttachmentsResponse = await getAttachments(version_id);
  // Get attachments
  const uploadedAttachments: UploadedAttachment[] =
    getAttachmentsResponse.attachments;
  const uploadedAttachmentsDict =
    getDictFromAttachmentArray(uploadedAttachments);
  // Get confirmations
  const initialSupplementaryConfirmation = getAttachmentsResponse.confirmation;

  // 🔍 Check if is a supplementary report
  const isSupplementaryReport = await getIsSupplementaryReport(version_id);
  // 🔍 Check if reports need verification
  const needsVerification = await getReportNeedsVerification(version_id);
  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.Attachments,
    version_id,
    "",
    {
      skipChangeReview: !isSupplementaryReport,
      skipVerification: !needsVerification,
    },
  );

  return (
    <AttachmentsForm
      version_id={version_id}
      initialUploadedAttachments={uploadedAttachmentsDict}
      navigationInformation={navInfo}
      isVerificationStatementMandatory={needsVerification}
      isSupplementaryReport={isSupplementaryReport}
      initialSupplementaryConfirmation={initialSupplementaryConfirmation}
    />
  );
};

export default AttachmentsPage;
