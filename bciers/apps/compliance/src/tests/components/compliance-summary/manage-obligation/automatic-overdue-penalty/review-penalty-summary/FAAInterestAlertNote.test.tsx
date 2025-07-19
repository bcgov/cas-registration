import { render, screen } from "@testing-library/react";
import { FAAInterestAlertNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/automatic-overdue-penalty/review-penalty-summary/FAAInterestAlertNote";

// Mock the AlertNote component
vi.mock("@bciers/components/form/components/AlertNote", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div role="alert" data-testid="alert-note">
      {children}
    </div>
  ),
}));

describe("FAAInterestAlertNote", () => {
  it("displays the FAA interest warning message", () => {
    render(<FAAInterestAlertNote />);

    const alertNote = screen.getByTestId("alert-note");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "Financial Administration Act (FAA) interest is incurred and accrues at prime + 3.00% daily if the automatic administrative penalty is not paid on time.",
    );
  });

  it("renders as an alert", () => {
    render(<FAAInterestAlertNote />);

    const alertNote = screen.getByRole("alert");
    expect(alertNote).toBeVisible();
  });
});
