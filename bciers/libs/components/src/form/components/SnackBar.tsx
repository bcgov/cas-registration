import Snackbar from "@mui/material/Snackbar";
import { BC_GOV_SEMANTICS_GREEN } from "@bciers/styles";

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
          backgroundColor: BC_GOV_SEMANTICS_GREEN,
        },
      }}
    />
  );
};

export default SnackBar;
