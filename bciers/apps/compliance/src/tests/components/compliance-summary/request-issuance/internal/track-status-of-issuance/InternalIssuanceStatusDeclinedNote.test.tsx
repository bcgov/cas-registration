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
    render(<InternalIssuanceStatusDeclinedNote />);

    const alertIcon = screen.getByTestId("alert-icon");
    expect(alertIcon).toBeVisible();
    expect(alertIcon).toHaveAttribute("width", "20");
    expect(alertIcon).toHaveAttribute("height", "20");
  });
});
