export interface UploadedAttachment {
  id: number;
  attachment_name: string;
  attachment_type: string;
}

export interface SupplementaryConfirmation {
  confirm_supplementary_required_attachments_uploaded: boolean;
  confirm_supplementary_existing_attachments_relevant: boolean;
}
