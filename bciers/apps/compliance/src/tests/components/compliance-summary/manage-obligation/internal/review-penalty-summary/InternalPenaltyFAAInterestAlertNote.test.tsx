import { render, screen } from "@testing-library/react";
import { InternalPenaltyFAAInterestAlertNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-penalty-summary/InternalPenaltyFAAInterestAlertNote";

vi.mock("@bciers/components/form/components/AlertNote", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div role="alert" data-testid="alert-note">
      {children}
    </div>
  ),
}));

const mockPenaltyData = {
  penalty_status: "Not Paid",
  penalty_type: "Automatic Overdue",
  penalty_charge_rate: "0.68",
  total_penalty: "100.00",
  total_amount: "1100.00",
  due_date: "2026-11-30",
  invoice_number: "INV-001",
};

describe("InternalPenaltyFAAInterestAlertNote", () => {
  it("displays the FAA interest warning message for internal penalties", () => {
    render(
      <InternalPenaltyFAAInterestAlertNote
        registry={{ formContext: mockPenaltyData }}
      />,
    );

    const alertNote = screen.getByTestId("alert-note");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "Automatic overdue penalty accrues daily at 0.68% of the unpaid balance until the obligation is paid in full. If automatic overdue penalty is not paid by the due date, FAA interest will be incurred.",
    );
  });

  it("renders as an alert", () => {
    render(
      <InternalPenaltyFAAInterestAlertNote
        registry={{ formContext: mockPenaltyData }}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeVisible();
  });
});
