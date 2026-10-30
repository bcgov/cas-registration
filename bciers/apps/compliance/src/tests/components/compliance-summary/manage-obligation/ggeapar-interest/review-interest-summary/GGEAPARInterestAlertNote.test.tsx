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
      "GGEAPAR interest accrues daily at an annual rate of prime + 3% until the obligation is paid in full. If GGEAPAR interest is not paid by the due date, FAA interest will be incurred.",
    );
  });

  it("renders as an alert", () => {
    render(<GGEAPARInterestAlertNote />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeVisible();
  });
});
