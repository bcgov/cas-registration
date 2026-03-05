import Alert from "@mui/material/Alert";
import AlertIcon from "@bciers/components/icons/AlertIcon";

export const complianceNote = (
  <Alert severity="warning" icon={<AlertIcon fill="#635231" />}>
    Your compliance obligation may be affected by changes to the values you have
    made.
  </Alert>
);

export const reviewChangesNote = (
  <Alert severity="warning" icon={false}>
    Review the changes you have made and enter the reason for change.
  </Alert>
);
