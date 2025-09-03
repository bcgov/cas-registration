import AlertNote from "@bciers/components/form/components/AlertNote";
import { AlertIcon } from "@bciers/components/icons";
import { AnalystSuggestion } from "@bciers/utils/src/enums";

type Props = {
  formContext: {
    analystSuggestion: AnalystSuggestion;
  };
};

export const InternalIssuanceStatusDeclinedNote = ({
  formContext: { analystSuggestion },
}: Props) => {
  return (
    <AlertNote icon={<AlertIcon width="20" height="20" />}>
      {analystSuggestion === AnalystSuggestion.REQUIRING_SUPPLEMENTARY_REPORT
        ? "Please contact the operator to clarify the supplementary report requirement in the previous step. This request has been declined automatically."
        : "The issuance request is declined. The earned credits will not be issued to the holding account as identified below in B.C. Carbon Registry (BCCR)."}
    </AlertNote>
  );
};
