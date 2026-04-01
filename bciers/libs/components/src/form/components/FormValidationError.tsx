import { Alert } from "@mui/material";
import AlertIcon from "@bciers/components/icons/AlertIcon";

interface FormValidationErrorProps {
  message: string;
}

const FormValidationError = ({ message }: FormValidationErrorProps) => (
  <Alert severity="error" className="my-2 items-center" icon={<AlertIcon />}>
    {message}
  </Alert>
);

export default FormValidationError;
