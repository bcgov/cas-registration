import { render, screen, within } from "@testing-library/react";
import { useSearchParams } from "@bciers/testConfig/mocks";
import { ComplianceSummary } from "@/compliance/src/app/types";
import ElicensingInvoicesDataGrid from "@/compliance/src/app/components/elicensing-invoices/ElicensingInvoicesDataGrid";

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockResponse = {
  rows: [
    {
      compliance_period: 2024,
      operator_legal_name: "Operator name",
      operation_name: "Operation 1",
      invoice_total: "421170.80",
      total_adjustments: "5.00",
      total_payments: "421170.80",
      invoice_type: "Compliance obligation",
      id: 1,
      invoice_number: "OBI702922",
      outstanding_balance: "0.00",
    },
    {
      compliance_period: 2024,
      operator_legal_name: "Operator name",
      operation_name: "Operation 2",
      invoice_total: "80280.84",
      total_adjustments: "6.00",
      total_payments: "0.00",
      invoice_type: "Automatic overdue penalty",
      id: 2,
      invoice_number: "OBI702923",
      outstanding_balance: "80280.84",
    },
  ],
  row_count: 2,
};

describe("ElicensingInvoicesDataGrid component", () => {
  it("renders the ElicensingInvoicesDataGrid with initial data", async () => {
    render(<ElicensingInvoicesDataGrid initialData={mockResponse} />);

    // Verify headers are present
    expect(
      screen.getByRole("columnheader", { name: "Compliance Period" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Operator Name" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Operation Name" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Invoice Type" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Invoice Number" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Invoice Total" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Total Adjustments" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Total Payments" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Outstanding Balance" }),
    ).toBeVisible();

    // Verify data displays
    const summaryRows = screen.getAllByRole("row");
    expect(summaryRows.length).toBe(3); // header + 2 data rows

    // Check first row in detail
    const firstRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 1"),
    );
    expect(firstRow).toBeTruthy();

    expect(within(firstRow!).getByText("2024")).toBeVisible();
    expect(within(firstRow!).getByText("Operator name")).toBeVisible();
    expect(within(firstRow!).getByText("Compliance obligation")).toBeVisible();
    expect(within(firstRow!).getByText("OBI702922")).toBeVisible();
    expect(within(firstRow!).getAllByText("$421,170.80")).toHaveLength(2);
    expect(within(firstRow!).getByText("$5.00")).toBeVisible();
    expect(within(firstRow!).getByText("$0.00")).toBeVisible();
  });
});
