import { render, screen } from "@testing-library/react";
import { GGEAPARInterestAlertNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/ggeapar-interest/review-interest-summary/GGEAPARInterestAlertNote";

vi.mock("@bciers/components/form/components/AlertNote", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div role="alert" data-testid="alert-note">
      {children}
    </div>
  ),
}));

describe("GGEAPARInterestAlertNote", () => {
  it("displays the FAA interest warning message for GGEAPAR", () => {
    render(<GGEAPARInterestAlertNote />);

    const alertNote = screen.getByTestId("alert-note");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "Financial Administration Act (FAA) interest is incurred and accrues at prime + 3.00% annually if the GGEAPAR interest is not paid on time.",
    );
  });

  it("renders as an alert", () => {
    render(<GGEAPARInterestAlertNote />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeVisible();
  });
});
