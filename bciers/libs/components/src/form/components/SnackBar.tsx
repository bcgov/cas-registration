import Snackbar from "@mui/material/Snackbar";

interface SnackBarProps {
  isSnackbarOpen: boolean;
  setIsSnackbarOpen: (value: boolean) => void;
  message: string;
  autoHideDuration?: number;
}

const SnackBar: React.FC<SnackBarProps> = ({
  isSnackbarOpen,
  setIsSnackbarOpen,
  message,
  autoHideDuration = 5000,
}) => {
  return (
    <Snackbar
      open={isSnackbarOpen}
      message={message}
      autoHideDuration={autoHideDuration}
      onClose={() => setIsSnackbarOpen(false)}
      className="[&_.MuiSnackbarContent-root]:bg-bc-success-green"
    />
  );
};

export default SnackBar;
