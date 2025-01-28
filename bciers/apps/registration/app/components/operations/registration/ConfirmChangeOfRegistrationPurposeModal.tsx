"use client";

import SimpleModal from "@bciers/components/modal/SimpleModal";

interface Props {
  pendingChangeRegistrationPurpose: boolean;
  cancelRegistrationPurposeChange: any;
  confirmRegistrationPurposeChange: any;
}

export default function ConfirmChangeOfRegistrationPurposeModal({
  pendingChangeRegistrationPurpose,
  cancelRegistrationPurposeChange,
  confirmRegistrationPurposeChange,
}: Props) {
  return (
    <SimpleModal
      title="Confirmation"
      open={pendingChangeRegistrationPurpose !== undefined}
      onCancel={cancelRegistrationPurposeChange}
      onConfirm={confirmRegistrationPurposeChange}
      confirmText="Change registration purpose"
    >
      Are you sure you want to change your registration purpose? If you proceed,
      all of the form data you have entered will be lost.
    </SimpleModal>
  );
}
