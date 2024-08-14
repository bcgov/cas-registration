import Snackbar from "@mui/material/Snackbar";
import { GREEN_SNACKBAR_COLOR } from "@bciers/styles";

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
      sx={{
        "& .MuiSnackbarContent-root": {
          backgroundColor: GREEN_SNACKBAR_COLOR,
        },
      }}
    />
  );
};

export default SnackBar;
