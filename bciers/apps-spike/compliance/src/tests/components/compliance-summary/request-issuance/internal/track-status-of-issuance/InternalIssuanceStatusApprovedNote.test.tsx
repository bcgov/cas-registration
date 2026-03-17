import { render, screen } from "@testing-library/react";
import { InternalIssuanceStatusApprovedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalIssuanceStatusApprovedNote";

vi.mock("@bciers/components/icons/Check", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="check-icon" {...props}>
      Check Icon
    </div>
  ),
}));

describe("InternalIssuanceStatusApprovedNote", () => {
  it("displays the correct text content", () => {
    render(<InternalIssuanceStatusApprovedNote />);

    const approvedNoteTextPatterns = [
      /The issuance request is approved/i,
      /The earned credits have been issued/i,
      /to the holding account/i,
      /as identified below in B\.C\. Carbon Registry \(BCCR\) successfully/i,
    ];

    for (const textPattern of approvedNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
  });

  it("displays the Check icon with correct props", () => {
    render(<InternalIssuanceStatusApprovedNote />);

    const approvedNoteCheckIcon = screen.getByTestId("check-icon");
    expect(approvedNoteCheckIcon).toBeVisible();
    expect(approvedNoteCheckIcon).toHaveAttribute("width", "20");
    expect(approvedNoteCheckIcon).toHaveAttribute("height", "20"); //
  });
});
