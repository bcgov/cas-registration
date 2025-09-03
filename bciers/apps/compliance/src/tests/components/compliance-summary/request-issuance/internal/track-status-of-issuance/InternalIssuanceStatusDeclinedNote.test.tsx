import { render, screen } from "@testing-library/react";
import { InternalIssuanceStatusDeclinedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalIssuanceStatusDeclinedNote";
import { AnalystSuggestion } from "@bciers/utils/src/enums";

vi.mock("@bciers/components/icons/AlertIcon", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="alert-icon" {...props}>
      Alert Icon
    </div>
  ),
}));

describe("InternalIssuanceStatusDeclinedNote", () => {
  it("displays the correct text content when the issuance is declined because an analyst requests a supplmentary report", () => {
    render(
      <InternalIssuanceStatusDeclinedNote
        formContext={{
          analystSuggestion: AnalystSuggestion.REQUIRING_SUPPLEMENTARY_REPORT,
        }}
      />,
    );

    const declinedNoteTextPatterns = [
      /Please contact the operator to clarify/i,
      /the supplementary report requirement in the previous step./i,
      /This request has been declined automatically./i,
    ];

    for (const textPattern of declinedNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
  });

  it("displays the correct text content when the issuance is declined by the director", () => {
    render(
      <InternalIssuanceStatusDeclinedNote
        formContext={{ analystSuggestion: AnalystSuggestion.READY_TO_APPROVE }}
      />,
    );

    const declinedNoteTextPatterns = [
      /The issuance request is declined/i,
      /The earned credits will not be issued/i,
      /to the holding account/i,
      /as identified below in B\.C\. Carbon Registry \(BCCR\)/i,
    ];

    for (const textPattern of declinedNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
  });

  it("displays the AlertIcon with correct props", () => {
    render(
      <InternalIssuanceStatusDeclinedNote
        formContext={{ analystSuggestion: AnalystSuggestion.READY_TO_APPROVE }}
      />,
    );

    const alertIcon = screen.getByTestId("alert-icon");
    expect(alertIcon).toBeVisible();
    expect(alertIcon).toHaveAttribute("width", "20");
    expect(alertIcon).toHaveAttribute("height", "20");
  });
});
