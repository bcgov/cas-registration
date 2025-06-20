import AlertNote from "@bciers/components/form/components/AlertNote";
import { Link } from "@mui/material";
import React from "react";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";
import { AlertIcon } from "@bciers/components/icons";

export const IssuanceStatusChangesRequiredNote = () => {
  return (
    <AlertNote icon={<AlertIcon width="20" height="20" />}>
      Your request has not been approved yet. Please{" "}
      {/* TODO: Set href to Supplementary Report page after the url is known
         after the task "Supplementary Report - Create a Review Changes page"
         #479 is implemented */}
      <Link href="#" className="text-bc-link-blue decoration-bc-link-blue">
        submit a supplementary report
      </Link>{" "}
      in Reporting to make the changes required below, or contact us at{" "}
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
