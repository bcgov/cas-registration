import AlertNote from "@bciers/components/form/components/AlertNote";
import Check from "@bciers/components/icons/Check";
import { Link } from "@mui/material";
import React from "react";
import { bcCarbonRegistryLink } from "@bciers/utils/src/urls";

export const IssuanceStatusApprovedNote = () => {
  return (
    <AlertNote icon={<Check width={20} height={20} />}>
      Your request is approved. The earned credits have been issued to your
      holding account as identified below in the{" "}
      <Link
        href={bcCarbonRegistryLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-bc-link-blue decoration-bc-link-blue"
      >
        B.C. Carbon Registry
      </Link>{" "}
      (BCCR) successfully.
    </AlertNote>
  );
};
