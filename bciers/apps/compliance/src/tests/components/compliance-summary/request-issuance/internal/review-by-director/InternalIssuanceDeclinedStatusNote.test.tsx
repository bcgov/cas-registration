import { render, screen } from "@testing-library/react";
import { InternalIssuanceDeclinedStatusNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/review-by-director/InternalIssuanceDeclinedStatusNote";

vi.mock("@bciers/components/form/components/AlertNote", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div role="alert" data-testid="alert-note">
      {children}
    </div>
  ),
}));

describe("InternalIssuanceDeclinedStatusNote", () => {
  it("renders the component with correct content and accessibility", () => {
    render(<InternalIssuanceDeclinedStatusNote />);

    const alertNote = screen.getByTestId("alert-note");
    const alert = screen.getByRole("alert");
    const expectedText =
      "Supplementary report was required in the previous step, this request has been declined automatically.";

    expect(alertNote).toBeVisible();
    expect(alert).toBeVisible();
    expect(screen.getByText(expectedText)).toBeVisible();
  });
});
