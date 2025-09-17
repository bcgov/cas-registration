import AlertNote from "@bciers/components/form/components/AlertNote";
import { Link } from "@mui/material";
import React from "react";
import { AlertIcon } from "@bciers/components/icons";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";

export const IssuanceStatusDeclinedNote = () => {
  return (
    <AlertNote icon={<AlertIcon width="20" height="20" />}>
      Your request is declined. The earned credits will not be issued to your
      holding account as identified below in the B.C. Carbon Registry (BCCR).
      Please contact us at{" "}
      <Link href={ghgRegulatorEmail}>GHGRegulator@gov.bc.ca</Link> for further
      information or assistance in submitting a supplementary report.
    </AlertNote>
  );
};
