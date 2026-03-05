import { render, screen } from "@testing-library/react";
import { AutomaticOverduePenaltyNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/pay-obligation-track-payments/AutomaticOverduePenaltyNote";

// Mock the AlertNote component
vi.mock("@bciers/components/form/components/AlertNote", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div role="alert" data-testid="alert-note">
      {children}
    </div>
  ),
}));

describe("AutomaticOverduePenaltyNote", () => {
  it("displays the penalty warning message", () => {
    render(<AutomaticOverduePenaltyNote />);

    const alertNote = screen.getByTestId("alert-note");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "You have an automatic administrative penalty because the compliance obligation was fully met after the compliance obligation deadline. Please proceed to review and pay the penalty.",
    );
  });

  it("renders as an alert", () => {
    render(<AutomaticOverduePenaltyNote />);

    const alertNote = screen.getByRole("alert");
    expect(alertNote).toBeVisible();
  });
});
