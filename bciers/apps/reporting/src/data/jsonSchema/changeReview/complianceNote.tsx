import Alert from "@mui/material/Alert";
import AlertIcon from "@bciers/components/icons/AlertIcon";

export const ComplianceNote = (
  <Alert severity="warning" icon={<AlertIcon fill="#635231" />}>
    Your compliance obligation may be affected by changes to the values you have
    made.
  </Alert>
);
