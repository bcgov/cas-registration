import { Alert } from "@mui/material";
import AlertIcon from "@bciers/components/icons/AlertIcon";

export const MonetaryPaymentsAlertNote = () => {
  return (
    <div className="mb-5">
      <Alert severity="info" icon={<AlertIcon />}>
        Your compliance obligation for the 2024 reporting year is{" "}
        <strong>due on November 30, 2025</strong>. Please pay five business days
        in advance to account for the processing time.
      </Alert>
    </div>
  );
};
