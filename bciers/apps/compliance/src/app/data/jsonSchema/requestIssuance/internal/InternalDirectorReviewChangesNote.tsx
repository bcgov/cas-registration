import React from "react";
import AlertNote from "@bciers/components/form/components/AlertNote";

export const InternalDirectorReviewChangesNote = () => {
  return (
    <AlertNote>
      Changes were required in the previous step. You may not decline or approve
      the request until the supplementary report is submitted and the earned
      credits are adjusted accordingly.
    </AlertNote>
  );
};

export default InternalDirectorReviewChangesNote;
