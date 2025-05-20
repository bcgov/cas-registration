import { render, screen } from "@testing-library/react";
import { MonetaryPaymentsGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/MonetaryPaymentsGrid";
import { PaymentsData } from "@/compliance/src/app/types/payments";
import { vi } from "vitest";

// Mock useSearchParams
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe("MonetaryPaymentsGrid", () => {
  const mockPaymentsData: PaymentsData = {
    rows: [
      {
        id: 1,
        paymentReceivedDate: "2024-03-20",
        paymentAmountApplied: 1000,
        paymentMethod: "Wire",
        transactionType: "Payment",
        receiptNumber: "REC-123",
      },
    ],
    row_count: 1,
  };

  it("renders the alert note when no data is provided", () => {
    render(<MonetaryPaymentsGrid />);
    expect(
      screen.getByText("You have not made any monetary payment yet."),
    ).toBeInTheDocument();
  });

  it("renders the alert note when data has no rows", () => {
    render(<MonetaryPaymentsGrid data={{ rows: [], row_count: 0 }} />);
    expect(
      screen.getByText("You have not made any monetary payment yet."),
    ).toBeInTheDocument();
  });

  it("renders payment data when available", () => {
    render(<MonetaryPaymentsGrid data={mockPaymentsData} />);
    expect(screen.getByText("2024-03-20")).toBeInTheDocument();
    expect(screen.getByText("$1,000.00")).toBeInTheDocument();
    expect(screen.getByText("Wire")).toBeInTheDocument();
    expect(screen.getByText("Payment")).toBeInTheDocument();
    expect(screen.getByText("REC-123")).toBeInTheDocument();
  });
});
