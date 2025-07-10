import React from "react";
import AlertNote from "@bciers/components/form/components/AlertNote";

export const InternalDirectorReviewChangesNote = () => {
  return (
    <AlertNote>
      Change of BCCR Holding Account ID was required in the previous step. You
      cannot approve or decline this request until industry user has updated
      their BCCR Holding Account ID.
    </AlertNote>
  );
};

export default InternalDirectorReviewChangesNote;
