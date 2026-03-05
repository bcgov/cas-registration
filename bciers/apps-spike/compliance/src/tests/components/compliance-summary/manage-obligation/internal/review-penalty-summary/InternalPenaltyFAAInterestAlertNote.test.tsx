import { render, screen } from "@testing-library/react";
import { InternalPenaltyFAAInterestAlertNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-penalty-summary/InternalPenaltyFAAInterestAlertNote";

vi.mock("@bciers/components/form/components/AlertNote", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div role="alert" data-testid="alert-note">
      {children}
    </div>
  ),
}));

describe("InternalPenaltyFAAInterestAlertNote", () => {
  it("displays the FAA interest warning message for internal penalties", () => {
    render(<InternalPenaltyFAAInterestAlertNote />);

    const alertNote = screen.getByTestId("alert-note");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "Financial Administration Act (FAA) interest is incurred and accrues at prime + 3.00% annually if the automatic administrative penalty is not paid on time.",
    );
  });

  it("renders as an alert", () => {
    render(<InternalPenaltyFAAInterestAlertNote />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeVisible();
  });
});
