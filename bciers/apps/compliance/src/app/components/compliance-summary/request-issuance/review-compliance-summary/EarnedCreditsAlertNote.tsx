import { AlertIcon } from "@bciers/components/icons";
import { bcCarbonRegistryLink } from "@bciers/utils/src/urls";
import { Link, Paper } from "@mui/material";

export const EarnedCreditsAlertNote = () => {
  return (
    <Paper
      className="p-[16px] mb-[10px] bg-[#DCE9F6] text-bc-text"
      data-testid="earned-credits-alert-note"
    >
      <div className="flex items-center">
        <AlertIcon width="40" height="40" />
        <p className="ml-[10px] my-0">
          The earned credits have not been issued yet. You may request issuance
          of them as long as you have an active trading account in the{" "}
          <Link
            href={bcCarbonRegistryLink}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
          >
            B.C. Carbon Registry
          </Link>{" "}
          (BCCR). Once issued, you may trade or use them to meet your compliance
          obligation.
        </p>
      </div>
    </Paper>
  );
};
