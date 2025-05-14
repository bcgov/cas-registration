import { Alert } from "@mui/material";
import AlertIcon from "@bciers/components/icons/AlertIcon";

export const MonetaryPaymentsAlertNote = () => {
  return (
    <div className="mb-5">
      <Alert severity="info" icon={<AlertIcon />}>
        You have not made any monetary payment yet.
      </Alert>
    </div>
  );
};
