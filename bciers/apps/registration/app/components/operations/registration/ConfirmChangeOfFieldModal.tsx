"use client";

import SimpleModal from "@bciers/components/modal/SimpleModal";

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmButtonText?: string;
  modalText: string;
}

export default function ConfirmChangeOfFieldModal({
  open,
  onCancel,
  onConfirm,
  confirmButtonText = "Confirm",
  modalText,
}: Props) {
  return (
    <SimpleModal
      title="Confirmation"
      open={open}
      onCancel={onCancel}
      onConfirm={onConfirm}
      confirmText={confirmButtonText}
    >
      {modalText}
    </SimpleModal>
  );
}
