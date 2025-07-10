import AlertNote from "@bciers/components/form/components/AlertNote";
import { TimeIcon } from "@bciers/components/icons";
import { Link } from "@mui/material";
import { BC_GOV_YELLOW } from "@bciers/styles";
import React from "react";
import { bcCarbonRegistryLink } from "@bciers/utils/src/urls";

export const IssuanceStatusAwaitingNote = () => {
  return (
    <AlertNote icon={<TimeIcon fill={BC_GOV_YELLOW} width="25" height="25" />}>
      Your request has been submitted successfully. Once your request is
      approved, the earned credits will be issued to your holding account as
      identified below in the{" "}
      <Link
        href={bcCarbonRegistryLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-bc-link-blue decoration-bc-link-blue"
      >
        B.C. Carbon Registry
      </Link>{" "}
      (BCCR).
    </AlertNote>
  );
};
