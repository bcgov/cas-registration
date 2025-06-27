import { InternalDirectorReviewChangesNote } from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/InternalDirectorReviewChangesNote";
import { render, screen } from "@testing-library/react";

vi.mock("@bciers/components/icons/AlertIcon", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="alert-icon" {...props}>
      Alert Icon
    </div>
  ),
}));

describe("InternalDirectorReviewChangesNote", () => {
  it("displays the correct text content", () => {
    render(<InternalDirectorReviewChangesNote />);

    const changesNoteTextPatterns = [
      /Changes were required in the previous step/i,
      /You may not decline or approve the request/i,
      /until the supplementary report is submitted/i,
      /and the earned credits are adjusted accordingly/i,
    ];

    for (const textPattern of changesNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
  });

  it("displays the AlertIcon with correct props", () => {
    render(<InternalDirectorReviewChangesNote />);

    const alertIcon = screen.getByTestId("alert-icon");
    expect(alertIcon).toBeVisible();
  });
});
