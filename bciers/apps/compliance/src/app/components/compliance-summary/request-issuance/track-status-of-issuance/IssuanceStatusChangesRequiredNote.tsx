import AlertNote from "@bciers/components/form/components/AlertNote";
import { Link } from "@mui/material";
import React from "react";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";
import { AlertIcon } from "@bciers/components/icons";

export const IssuanceStatusChangesRequiredNote = () => {
  return (
    <AlertNote icon={<AlertIcon width="20" height="20" />}>
      Your request is not approved yet. Please make the changes required below
      before submitting a new request, or contact us at{" "}
      <Link
        href={ghgRegulatorEmail}
        className="text-bc-link-blue decoration-bc-link-blue"
      >
        GHGRegulator@gov.bc.ca
      </Link>{" "}
      if you have questions.
    </AlertNote>
  );
};
