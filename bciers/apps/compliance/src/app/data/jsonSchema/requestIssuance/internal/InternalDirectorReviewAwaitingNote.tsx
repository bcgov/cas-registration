import React from "react";
import AlertNote from "@bciers/components/form/components/AlertNote";
import { AlertIcon } from "@bciers/components/icons";

export const InternalDirectorReviewAwaitingNote = () => {
  return (
    <AlertNote icon={<AlertIcon fill="#635231" />}>
      Once the issuance request is approved, the earned credits will be issued
      to the holding account as identified above in B.C. Carbon Registry.
    </AlertNote>
  );
};

export default InternalDirectorReviewAwaitingNote;
