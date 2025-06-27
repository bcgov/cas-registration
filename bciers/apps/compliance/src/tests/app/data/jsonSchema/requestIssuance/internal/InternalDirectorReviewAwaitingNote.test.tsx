import { InternalDirectorReviewAwaitingNote } from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/InternalDirectorReviewAwaitingNote";
import { render, screen } from "@testing-library/react";

vi.mock("@bciers/components/icons/AlertIcon", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="alert-icon" {...props}>
      Alert Icon
    </div>
  ),
}));

describe("InternalDirectorReviewAwaitingNote", () => {
  it("displays the correct text content", () => {
    render(<InternalDirectorReviewAwaitingNote />);

    const awaitingNoteTextPatterns = [
      /Once the issuance request is approved/i,
      /the earned credits will be issued/i,
      /to the holding account/i,
      /as identified above in B\.C\. Carbon Registry/i,
    ];

    for (const textPattern of awaitingNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
  });

  it("displays the AlertIcon with correct props", () => {
    render(<InternalDirectorReviewAwaitingNote />);

    const alertIcon = screen.getByTestId("alert-icon");
    expect(alertIcon).toBeVisible();
  });
});
