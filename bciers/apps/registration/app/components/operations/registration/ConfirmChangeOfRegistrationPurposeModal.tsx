"use client";

import SimpleModal from "@bciers/components/modal/SimpleModal";

interface Props {
  open: boolean;
  cancelRegistrationPurposeChange: any;
  confirmRegistrationPurposeChange: any;
}

export default function ConfirmChangeOfRegistrationPurposeModal({
  open,
  cancelRegistrationPurposeChange,
  confirmRegistrationPurposeChange,
}: Props) {
  return (
    <SimpleModal
      title="Confirmation"
      open={open}
      onCancel={cancelRegistrationPurposeChange}
      onConfirm={confirmRegistrationPurposeChange}
      confirmText="Change registration purpose"
    >
      Are you sure you want to change your registration purpose? If you proceed,
      all of the form data you have entered will be lost.
    </SimpleModal>
  );
}
