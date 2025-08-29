import AlertNote from "@bciers/components/form/components/AlertNote";
import { AlertIcon } from "@bciers/components/icons";

export const InternalIssuanceStatusDeclinedNote = () => {
  return (
    <AlertNote icon={<AlertIcon width="20" height="20" />}>
      Please contact the operator to clarify the supplementary report
      requirement in the previous step. This request has been declined
      automatically.
    </AlertNote>
  );
};
