import ErrorIcon from "@mui/icons-material/Error";
import { SxProps } from "@mui/material";

interface Props {
  sx?: SxProps;
}

const ErrorCircle = ({ sx }: Props) => (
  <ErrorIcon
    sx={{
      color: "#A1260D",
      backgroundColor: "#FEE3E0",
      borderRadius: "50%",
      fontSize: 20,
      mr: 1,
      ...sx, // allow overrides if needed
    }}
  />
);

export default ErrorCircle;
