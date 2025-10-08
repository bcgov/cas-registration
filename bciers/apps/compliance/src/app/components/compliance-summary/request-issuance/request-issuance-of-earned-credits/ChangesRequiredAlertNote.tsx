import AlertNote from "@bciers/components/form/components/AlertNote";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";
import { Link } from "@mui/material";

export const ChangesRequiredAlertNote = () => {
  return (
    <AlertNote>
      Changes required. Please change your BCCR Holding Account ID. If you have
      questions, contact{" "}
      <Link
        className="text-bc-link-blue decoration-bc-link-blue"
        href={ghgRegulatorEmail}
        target="_blank"
        rel="noopener noreferrer"
      >
        GHGRegulator@gov.bc.ca
      </Link>
      .
    </AlertNote>
  );
};
