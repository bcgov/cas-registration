import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";

interface Props {
  children: React.ReactNode;
  id?: string;
  onClose: any;
  open: boolean;
  title?: string;
}

const Modal: React.FC<Props> = ({ children, id, onClose, open, title }) => {
  return (
    <Dialog
      id={id}
      onClose={onClose}
      open={open}
      closeAfterTransition
      aria-labelledby={title}
      maxWidth="xl"
      data-testid="modal"
      PaperProps={{ sx: { borderRadius: "2px" } }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "#FFFFFF",
          padding: "8px 16px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {title}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: "#FFFFFF",
              paddingRight: "0",
            }}
          >
            X
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent
        sx={{
          padding: "16px",
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
