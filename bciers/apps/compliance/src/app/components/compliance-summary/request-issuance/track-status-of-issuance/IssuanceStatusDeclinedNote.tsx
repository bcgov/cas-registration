import AlertNote from "@bciers/components/form/components/AlertNote";
import { Link } from "@mui/material";
import React from "react";
import { bcCarbonRegistryLink, bceabLink } from "@bciers/utils/src/urls";
import { AlertIcon } from "@bciers/components/icons";

export const IssuanceStatusDeclinedNote = () => {
  return (
    <AlertNote icon={<AlertIcon width="20" height="20" />}>
      Your request is declined. The earned credits will not be issued to your
      holding account as identified below in the{" "}
      <Link
        href={bcCarbonRegistryLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-bc-link-blue decoration-bc-link-blue"
      >
        B.C. Carbon Registry
      </Link>{" "}
      (BCCR). You may appeal the decision via the{" "}
      <Link
        href={bceabLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-bc-link-blue decoration-bc-link-blue"
      >
        B.C. Environmental Appeal Board
      </Link>{" "}
      (BCEAB).
    </AlertNote>
  );
};
