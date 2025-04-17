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
  const uploadedAttachments: UploadedAttachment[] =
    await getAttachments(version_id);

  const uploadedAttachmentsDict =
    getDictFromAttachmentArray(uploadedAttachments);

  //🔍 Check if reports need verification
  const needsVerification = await getReportNeedsVerification(version_id); //🔍 Check if is a supplementary report
  const isSupplementaryReportResponse =
    await getIsSupplementaryReport(version_id);
  const isSupplementaryReport =
    isSupplementaryReportResponse.is_supplementary_report_version;

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
      isSupplementaryReport={isSupplementaryReport}
    />
  );
};

export default AttachmentsPage;
