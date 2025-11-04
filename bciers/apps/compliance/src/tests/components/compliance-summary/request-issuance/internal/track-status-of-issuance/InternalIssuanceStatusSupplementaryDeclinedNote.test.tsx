import { render, screen } from "@testing-library/react";
import { InternalIssuanceStatusSupplementaryDeclinedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalIssuanceStatusSupplementaryDeclinedNote";

vi.mock("@bciers/components/icons/AlertIcon", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="alert-icon" {...props}>
      Alert Icon
    </div>
  ),
}));

describe("InternalIssuanceStatusSupplementaryDeclinedNote", () => {
  it("displays the correct text content when the issuance is declined because an industry user submits a supplementary report", () => {
    render(<InternalIssuanceStatusSupplementaryDeclinedNote />);

    const declinedNoteTextPatterns = [
      /This issuance request is automatically declined because a supplementary/i,
      /report was submitted./i,
    ];

    for (const textPattern of declinedNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
  });

  it("displays the AlertIcon with correct props", () => {
    render(<InternalIssuanceStatusSupplementaryDeclinedNote />);

    const alertIcon = screen.getByTestId("alert-icon");
    expect(alertIcon).toBeVisible();
    expect(alertIcon).toHaveAttribute("width", "25");
    expect(alertIcon).toHaveAttribute("height", "25");
  });
});
