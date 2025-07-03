import { render, screen, within } from "@testing-library/react";
import { MonetaryPaymentsGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/MonetaryPaymentsGrid";
import { PaymentsData } from "@/compliance/src/app/types";
import { useSearchParams } from "@bciers/testConfig/mocks";

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockValue = {
  gridData: {
    rows: [
      {
        id: 1,
        received_date: "2024-03-15",
        amount: 8000,
        method: "Bank Transfer",
        type: "Payment",
        payment_object_id: "REF-123",
      },
      {
        id: 2,
        received_date: "2024-03-16",
        amount: 4000,
        method: "Credit Card",
        type: "Payment",
        payment_object_id: "REF-124",
      },
    ],
    row_count: 2,
  } as PaymentsData,
};

describe("MonetaryPaymentsGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the grid with monetary payments data", () => {
    render(<MonetaryPaymentsGrid value={{ gridData: mockValue.gridData }} />);

    // Alert should not be present when there are rows
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    // Check grid headers
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

    // Verify search inputs are present
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(5);

    // Check grid data rows
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(4); // 1 header row + 1 filter row + 2 data rows

    // Check first row content
    const firstRow = rows[2];
    expect(within(firstRow).getByText("2024-03-15")).toBeVisible();
    expect(within(firstRow).getByText("$8,000.00")).toBeVisible();
    expect(within(firstRow).getByText("Bank Transfer")).toBeVisible();
    expect(within(firstRow).getByText("Payment")).toBeVisible();
    expect(within(firstRow).getByText("REF-123")).toBeVisible();

    // Check second row content
    const secondRow = rows[3];
    expect(within(secondRow).getByText("2024-03-16")).toBeVisible();
    expect(within(secondRow).getByText("$4,000.00")).toBeVisible();
    expect(within(secondRow).getByText("Credit Card")).toBeVisible();
    expect(within(secondRow).getByText("Payment")).toBeVisible();
    expect(within(secondRow).getByText("REF-124")).toBeVisible();
  });

  it("shows alert when no payments are made", () => {
    const emptyGridData = {
      rows: [],
      row_count: 0,
    } as PaymentsData;

    render(<MonetaryPaymentsGrid value={emptyGridData} />);

    // Alert should be present with correct message
    const alertNote = screen.getByRole("alert");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "You have not made any monetary payment yet.",
    );
  });
});
