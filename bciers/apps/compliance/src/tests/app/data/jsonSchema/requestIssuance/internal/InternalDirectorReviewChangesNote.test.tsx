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
      /Change of BCCR Holding Account ID was required in the previous step/i,
      /You cannot approve or decline this request until industry user has updated/i,
      /their BCCR Holding Account ID/i,
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
