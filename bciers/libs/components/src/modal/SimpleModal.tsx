import { Button, DialogActions, DialogContentText } from "@mui/material";
import Modal from "./Modal";

interface Props extends React.PropsWithChildren {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const SimpleModal: React.FC<Props> = ({
  open,
  title,
  onCancel,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  children,
}) => {
  return (
    <Modal open={open} title={title}>
      <DialogContentText>
        <p>{children}</p>
      </DialogContentText>
      <DialogActions>
        <Button variant="outlined" color="primary" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogActions>
    </Modal>
  );
};

export default SimpleModal;
