import AlertNote from "@bciers/components/form/components/AlertNote";
import React from "react";

export const InternalIssuanceStatusSupplementaryDeclinedNote = () => {
  return (
    <AlertNote>
      <>
        This issuance request is automatically declined because a supplementary
        report was submitted.
      </>
    </AlertNote>
  );
};
