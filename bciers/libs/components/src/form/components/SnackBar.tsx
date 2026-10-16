import Portal from "@mui/material/Portal";
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
  // Render at the end of <body>: inside a transformed ancestor (e.g. a DataGrid
  // cell) the fixed position would be relative to that ancestor, not the viewport
  return (
    <Portal>
      <Snackbar
        open={isSnackbarOpen}
        message={message}
        autoHideDuration={autoHideDuration}
        onClose={() => setIsSnackbarOpen(false)}
        className="[&_.MuiSnackbarContent-root]:bg-bc-success-green"
      />
    </Portal>
  );
};

export default SnackBar;
