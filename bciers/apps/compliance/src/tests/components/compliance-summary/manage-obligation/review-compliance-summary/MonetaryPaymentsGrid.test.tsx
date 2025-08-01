import { render, screen, within } from "@testing-library/react";
import { MonetaryPaymentsGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/MonetaryPaymentsGrid";
import type { PaymentData } from "@/compliance/src/app/types";
import { useSearchParams } from "@bciers/testConfig/mocks";

// Mocks
useSearchParams.mockReturnValue({
  get: vi.fn(),
});

// Mock data matching updated types
const mockPaymentsData: PaymentData = {
  row_count: 2,
  rows: [
    {
      id: "1",
      formatted_received_date: "Mar 15, 2024",
      amount: 8000,
      method: "EFT/Wire - OBPS",
      transaction_type: "Payment",
      payment_object_id: "REF-123",
      receipt_number: "R123456",
    },
    {
      id: "2",
      formatted_received_date: "Mar 30, 2024",
      amount: 4000,
      method: "EFT/Wire - OBPS",
      transaction_type: "Payment",
      payment_object_id: "REF-124",
      receipt_number: "R234567",
    },
  ],
};

describe("MonetaryPaymentsGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the grid with monetary payments data", () => {
    render(<MonetaryPaymentsGrid value={mockPaymentsData} />);

    // Alert should not be present
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    // Grid headers
    const headers = [
      "Payment Received Date",
      "Payment Amount Applied",
      "Payment Method",
      "Transaction Type",
      "Receipt Number",
    ];
    headers.forEach((header) => {
      expect(screen.getByRole("columnheader", { name: header })).toBeVisible();
    });

    // Data rows (1 header + 2 data rows = 3 total)
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);

    const [, firstRow, secondRow] = rows;

    within(firstRow).getByText(/Mar 15, 2024/);

    within(firstRow).getByText("$8,000.00");
    within(firstRow).getByText("EFT/Wire - OBPS");
    within(firstRow).getByText("Payment");
    within(firstRow).getByText("R123456");

    within(secondRow).getByText(/Mar 30, 2024/);
    within(secondRow).getByText("$4,000.00");
    within(secondRow).getByText("EFT/Wire - OBPS");
    within(secondRow).getByText("Payment");
    within(secondRow).getByText("R234567");
  });

  it("shows alert when no payments are made", () => {
    const emptyPaymentsData: PaymentData = {
      row_count: 0,
      rows: [],
    };

    render(<MonetaryPaymentsGrid value={emptyPaymentsData} />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeVisible();
    expect(alert).toHaveTextContent(
      "You have not made any monetary payment yet.",
    );
  });
});
