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
      <div>Are you sure you want to change your registration purpose?</div>
      <ul className="list-disc pl-5 mt-2">
        <li>Some operation information you have entered will be deleted.</li>
        <li>
          If this operation’s report is in progress, it will be deleted and
          restarted.
        </li>
      </ul>
    </SimpleModal>
  );
}
