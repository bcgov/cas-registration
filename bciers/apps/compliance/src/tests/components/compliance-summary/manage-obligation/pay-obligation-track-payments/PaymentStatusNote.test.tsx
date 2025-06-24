import { render, screen } from "@testing-library/react";
import { PaymentStatusNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/pay-obligation-track-payments/PaymentStatusNote";

// Mock the AlertNote component
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

// Mock the Check icon
vi.mock("@bciers/components/icons/Check", () => ({
  default: (props: any) => (
    <div data-testid="check-icon" {...props}>
      Check Icon
    </div>
  ),
}));

describe("PaymentStatusNote", () => {
  it("displays success message with check icon when outstanding balance is 0", () => {
    render(<PaymentStatusNote outstandingBalance={0} />);

    const alertNote = screen.getByTestId("alert-note");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "Your payment(s) has been received and applied successfully. Your compliance obligation has been fully met.",
    );

    const checkIcon = screen.getByTestId("check-icon");
    expect(checkIcon).toBeVisible();
    expect(checkIcon).toHaveAttribute("width", "20");
    expect(checkIcon).toHaveAttribute("height", "20");
  });

  it("displays payment instructions when outstanding balance is greater than 0", () => {
    render(<PaymentStatusNote outstandingBalance={500} />);

    const alertNote = screen.getByTestId("alert-note");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "Please pay the outstanding compliance obligation following the payment instructions. Once your payment(s) is received and applied, the outstanding compliance obligation balance will be updated below.",
    );

    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  it("displays payment instructions when outstanding balance is a decimal", () => {
    render(<PaymentStatusNote outstandingBalance={0.5} />);

    const alertNote = screen.getByTestId("alert-note");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "Please pay the outstanding compliance obligation following the payment instructions. Once your payment(s) is received and applied, the outstanding compliance obligation balance will be updated below.",
    );
  });
});
