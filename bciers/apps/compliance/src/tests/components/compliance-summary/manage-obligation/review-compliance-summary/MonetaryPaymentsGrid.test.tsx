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
      received_date: "2024-03-15",
      amount: 8000,
      payment_method: "Bank Transfer",
      transaction_type: "Payment",
      payment_object_id: "REF-123",
    },
    {
      id: "2",
      received_date: "2024-03-16",
      amount: 4000,
      payment_method: "Credit Card",
      transaction_type: "Payment",
      payment_object_id: "REF-124",
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

    // Filters
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(5);

    // Data rows (1 header + 1 filter + 2 data rows = 4 total)
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(4);

    const [, , firstRow, secondRow] = rows;

    within(firstRow).getByText("2024-03-15");
    within(firstRow).getByText("$8,000.00");
    within(firstRow).getByText("Bank Transfer");
    within(firstRow).getByText("Payment");
    within(firstRow).getByText("REF-123");

    within(secondRow).getByText("2024-03-16");
    within(secondRow).getByText("$4,000.00");
    within(secondRow).getByText("Credit Card");
    within(secondRow).getByText("Payment");
    within(secondRow).getByText("REF-124");
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
