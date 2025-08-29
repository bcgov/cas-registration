import { render, screen } from "@testing-library/react";
import { InternalIssuanceStatusDeclinedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalIssuanceStatusDeclinedNote";

vi.mock("@bciers/components/icons/AlertIcon", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="alert-icon" {...props}>
      Alert Icon
    </div>
  ),
}));

describe("InternalIssuanceStatusDeclinedNote", () => {
  it("displays the correct text content", () => {
    render(<InternalIssuanceStatusDeclinedNote />);

    const declinedNoteTextPatterns = [
      /Please contact the operator to clarify/i,
      /the supplementary report requirement in the previous step./i,
      /This request has been declined automatically./i,
    ];

    for (const textPattern of declinedNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
  });

  it("displays the AlertIcon with correct props", () => {
    render(<InternalIssuanceStatusDeclinedNote />);

    const alertIcon = screen.getByTestId("alert-icon");
    expect(alertIcon).toBeVisible();
    expect(alertIcon).toHaveAttribute("width", "20");
    expect(alertIcon).toHaveAttribute("height", "20");
  });
});
