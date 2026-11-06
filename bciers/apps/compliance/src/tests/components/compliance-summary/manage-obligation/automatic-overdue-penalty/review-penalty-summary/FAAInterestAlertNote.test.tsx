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

const mockPenaltyData = {
  penalty_status: "Not Paid",
  penalty_type: "Automatic Overdue",
  penalty_charge_rate: "0.44",
  total_penalty: "100.00",
  total_amount: "1100.00",
  due_date: "2026-11-30",
  invoice_number: "INV-001",
};

describe("FAAInterestAlertNote", () => {
  it("displays the FAA interest warning message", () => {
    render(
      <FAAInterestAlertNote registry={{ formContext: mockPenaltyData }} />,
    );

    const alertNote = screen.getByTestId("alert-note");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "Automatic overdue penalty accrues daily at 0.44% of the unpaid balance until the obligation is paid in full. If automatic overdue penalty is not paid by the due date, FAA interest will be incurred.",
    );
  });

  it("renders as an alert", () => {
    render(
      <FAAInterestAlertNote registry={{ formContext: mockPenaltyData }} />,
    );

    const alertNote = screen.getByRole("alert");
    expect(alertNote).toBeVisible();
  });
});
