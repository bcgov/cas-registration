import { render, screen } from "@testing-library/react";
import { PenaltyPaymentStatusNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/automatic-overdue-penalty/pay-penalty-track-payments/PenaltyPaymentStatusNote";
import { PenaltyStatus } from "@bciers/utils/src/enums";

// Mock AlertNote so we can easily inspect the rendered content without
// pulling in its full implementation or MUI dependencies.
vi.mock("@bciers/components/form/components/AlertNote", () => ({
  default: ({
    children,
    icon,
  }: {
    children: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div role="alert" data-testid="alert-note">
      {icon && <span data-testid="alert-icon">{icon}</span>}
      {children}
    </div>
  ),
}));

// Mock the Check icon so we can assert its presence and props.
vi.mock("@bciers/components/icons/Check", () => ({
  default: (props: any) => (
    <div data-testid="check-icon" {...props}>
      Check Icon
    </div>
  ),
}));

describe("PenaltyPaymentStatusNote", () => {
  const createFormContext = (
    outstanding_amount: string,
    penalty_status: PenaltyStatus,
  ) => ({
    outstanding_amount,
    penalty_status,
    data_is_fresh: true,
    payment_data: { data_is_fresh: true, rows: [], row_count: 0 },
    payments: [],
  });

  it("displays success message with check icon when penalty is paid", () => {
    const formContext = createFormContext("0", PenaltyStatus.PAID);

    render(<PenaltyPaymentStatusNote formContext={formContext} />);

    const alertNote = screen.getByTestId("alert-note");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "Your payment(s) has been received and applied successfully. Your automatic administrative penalty has been fully paid.",
    );

    const checkIcon = screen.getByTestId("check-icon");
    expect(checkIcon).toBeVisible();
    expect(checkIcon).toHaveAttribute("width", "20");
    expect(checkIcon).toHaveAttribute("height", "20");
  });

  it("displays payment instructions when outstanding penalty remains", () => {
    const formContext = createFormContext("500", PenaltyStatus.ACCRUING);

    render(<PenaltyPaymentStatusNote formContext={formContext} />);

    const alertNote = screen.getByTestId("alert-note");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "Please pay the outstanding penalty following the Payment Instructions. Once your payment(s) is received and applied, the outstanding penalty will be updated below.",
    );

    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  it("displays payment instructions when outstanding amount is a decimal", () => {
    const formContext = createFormContext("0.5", PenaltyStatus.ACCRUING);

    render(<PenaltyPaymentStatusNote formContext={formContext} />);

    const alertNote = screen.getByTestId("alert-note");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "Please pay the outstanding penalty following the Payment Instructions. Once your payment(s) is received and applied, the outstanding penalty will be updated below.",
    );
  });
});
