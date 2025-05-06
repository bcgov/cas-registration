"use client";

import SimpleModal from "@bciers/components/modal/SimpleModal";

interface Props {
  open: boolean;
  cancelTypeChange: any;
  confirmTypeChange: any;
}

export default function ConfirmChangeOfTypeModal({
  open,
  cancelTypeChange,
  confirmTypeChange,
}: Props) {
  return (
    <SimpleModal
      title="Confirmation"
      open={open}
      onCancel={cancelTypeChange}
      onConfirm={confirmTypeChange}
      confirmText="Change operation type"
    >
      Are you sure you want to change your operation type? If you proceed, some
      of the form data you have entered will be lost.
    </SimpleModal>
  );
}
