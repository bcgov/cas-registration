import AlertNote from "@bciers/components/form/components/AlertNote";
import { AlertIcon } from "@bciers/components/icons";

export const InternalIssuanceStatusDeclinedNote = () => {
  return (
    <AlertNote icon={<AlertIcon width="20" height="20" />}>
      The issuance request is declined. The earned credits will not be issued to
      the holding account as identified below in B.C. Carbon Registry (BCCR).
    </AlertNote>
  );
};
