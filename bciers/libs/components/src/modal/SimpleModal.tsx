import { Button, DialogActions, DialogContentText } from "@mui/material";
import Modal from "./Modal";
import SubmitButton from "@bciers/components/button/SubmitButton";
import React from "react";

interface Props extends React.PropsWithChildren {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  textComponentType?: "p" | "span" | "div";
  dialogContentClassName?: string;
  isSubmitting?: boolean;
}

const SimpleModal: React.FC<Props> = ({
  open,
  title,
  onCancel,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  textComponentType = "p",
  children,
  dialogContentClassName,
  isSubmitting = false,
}) => {
  return (
    <Modal open={open} title={title}>
      <DialogContentText
        className={`m-4 ${dialogContentClassName}`}
        component={textComponentType}
      >
        {children}
      </DialogContentText>
      <DialogActions>
        <Button variant="outlined" color="primary" onClick={onCancel}>
          {cancelText}
        </Button>
        <SubmitButton isSubmitting={isSubmitting} onClick={onConfirm}>
          {confirmText}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};

export default SimpleModal;
