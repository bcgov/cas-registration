"use client";

import ReadOnlyAttachmentElement from "@reporting/src/app/components/attachments/ReadOnlyAttachmentElement";
import { UploadedAttachment } from "@reporting/src/app/components/attachments/types";
import { ATTACHMENT_TYPE_LABELS } from "@reporting/src/app/components/attachments/constants";

interface Props {
  attachments: UploadedAttachment[];
  version_id: number;
}

const SubmittedAttachmentsSection: React.FC<Props> = ({
  attachments,
  version_id,
}) => {
  const attachmentsByType = Object.fromEntries(
    attachments.map((a): [string, UploadedAttachment] => [
      a.attachment_type,
      a,
    ]),
  );

  return (
    <section className="mb-6">
      <div className="w-full form-group field field-object form-heading-label flex items-center">
        <div className="form-heading text-xl font-bold">Attachments</div>
      </div>
      {Object.entries(ATTACHMENT_TYPE_LABELS).map(([type, label]) => {
        const attachment = attachmentsByType[type];
        return (
          <ReadOnlyAttachmentElement
            key={type}
            versionId={version_id}
            title={label}
            fileId={attachment?.id}
            fileName={attachment?.attachment_name}
          />
        );
      })}
    </section>
  );
};

export default SubmittedAttachmentsSection;
