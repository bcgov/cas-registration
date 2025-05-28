import AlertNote from "@bciers/components/form/components/AlertNote";
import { bcCarbonRegistryLink } from "@bciers/utils/src/urls";
import { Link } from "@mui/material";

export const EarnedCreditsAlertNote = () => {
  return (
    <AlertNote>
      The earned credits have not been issued yet. You may request issuance of
      them as long as you have an active trading account in the{" "}
      <Link
        href={bcCarbonRegistryLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        B.C. Carbon Registry
      </Link>{" "}
      (BCCR). Once issued, you may trade or use them to meet your compliance
      obligation.
    </AlertNote>
  );
};
