import AlertNote from "@bciers/components/form/components/AlertNote";
import { Link } from "@mui/material";
import React from "react";

export const IssuanceStatusSupplementaryDeclinedNote = () => {
  // const complianceSummaryID = props.formContext?.analystSuggestion;
  const path = `/compliance/compliance-administration/compliance-summaries/${4}/review-compliance-earned-credits-report`;

  return (
    <AlertNote>
      This issuance request is declined because you submitted a supplementary
      report. Please{" "}
      <Link href={path} className="text-bc-link-blue decoration-bc-link-blue">
        submit a new issuance of earned credits request.
      </Link>
    </AlertNote>
  );
};
