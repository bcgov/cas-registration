import { Button, DialogActions, DialogContentText } from "@mui/material";
import { DialogProps } from "@mui/material/Dialog";
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
  showConfirmButton?: boolean;
  textComponentType?: "p" | "span" | "div";
  dialogContentClassName?: string;
  isSubmitting?: boolean;
  maxWidth?: DialogProps["maxWidth"];
  fullWidth?: boolean;
}

const SimpleModal: React.FC<Props> = ({
  open,
  title,
  onCancel,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showConfirmButton = true,
  textComponentType = "div",
  children,
  dialogContentClassName,
  isSubmitting = false,
  maxWidth = "md",
  fullWidth = true,
}) => {
  return (
    <Modal open={open} title={title} maxWidth={maxWidth} fullWidth={fullWidth}>
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
        {showConfirmButton && (
          <SubmitButton isSubmitting={isSubmitting} onClick={onConfirm}>
            {confirmText}
          </SubmitButton>
        )}
      </DialogActions>
    </Modal>
  );
};

export default SimpleModal;
