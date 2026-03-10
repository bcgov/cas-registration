import { render, screen, within } from "@testing-library/react";
import { useSearchParams } from "@bciers/testConfig/mocks";
import ElicensingInvoicesDataGrid from "@/compliance/src/app/components/elicensing-invoices/ElicensingInvoicesDataGrid";
import userEvent from "@testing-library/user-event";
import * as generateInvoice from "@/compliance/src/app/utils/generateInvoice";

import { ComplianceInvoiceTypes } from "@bciers/utils/src/enums";
import { ElicensingInvoice } from "@/compliance/src/app/types";

vi.mock(
  "@/compliance/src/app/components/elicensing-invoices/generateInvoice",
  () => ({
    default: vi.fn(),
  }),
);
useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockResponse: { rows: ElicensingInvoice[]; row_count: number } = {
  rows: [
    {
      compliance_report_version_id: 1,
      compliance_period: 2024,
      operator_legal_name: "Operator name",
      operation_name: "Operation 1",
      invoice_total: "421170.80",
      total_adjustments: "5.00",
      total_payments: "421170.80",
      invoice_type: "obligation",
      id: 1,
      invoice_number: "OBI702922",
      outstanding_balance: "0.00",
      due_date: "2025-12-31",
      is_void: false,
      last_refreshed: "2026-03-10T10:00:00Z",
    },
    {
      compliance_report_version_id: 2,
      compliance_period: 2024,
      operator_legal_name: "Operator name",
      operation_name: "Operation 2",
      invoice_total: "80280.84",
      total_adjustments: "6.00",
      total_payments: "0.00",
      invoice_type: "automatic overdue penalty",
      id: 2,
      invoice_number: "OBI702923",
      outstanding_balance: "80280.84",
      due_date: "2025-12-31",
      is_void: false,
      last_refreshed: "2026-03-10T10:00:00Z",
    },
  ],
  row_count: 2,
};

describe("ElicensingInvoicesDataGrid component", () => {
  it("renders the ElicensingInvoicesDataGrid with initial data for an internal user", async () => {
    render(
      <ElicensingInvoicesDataGrid
        initialData={mockResponse}
        isInternalUser={true}
      />,
    );

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
    expect(summaryRows.length).toBe(4); // // header + search cell + 2 data rows

    // Check first row in detail
    const firstRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 1"),
    );
    expect(firstRow).toBeTruthy();

    expect(within(firstRow!).getByText("2024")).toBeVisible();
    expect(within(firstRow!).getByText("Operator name")).toBeVisible();
    expect(within(firstRow!).getByText("Obligation")).toBeVisible();
    expect(within(firstRow!).getByText("OBI702922")).toBeVisible();
    expect(within(firstRow!).getAllByText("$421,170.80")).toHaveLength(2);
    expect(within(firstRow!).getByText("$5.00")).toBeVisible();
    expect(within(firstRow!).getByText("$0.00")).toBeVisible();
  });

  it("renders the ElicensingInvoicesDataGrid with initial data for an external user", async () => {
    render(
      <ElicensingInvoicesDataGrid
        initialData={mockResponse}
        isInternalUser={false}
      />,
    );

    // Verify headers are present
    expect(
      screen.getByRole("columnheader", { name: "Compliance Period" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Operator Name" }),
    ).not.toBeInTheDocument();
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
    expect(summaryRows.length).toBe(4); // header + search cell + 2 data rows
  });

  it("calls generateInvoice when invoice number link is clicked", async () => {
    const user = userEvent.setup();

    const generateInvoiceSpy = vi
      .spyOn(generateInvoice, "default")
      .mockResolvedValue(undefined);

    render(
      <ElicensingInvoicesDataGrid
        initialData={mockResponse}
        isInternalUser={true}
      />,
    );

    await user.click(screen.getByRole("button", { name: "OBI702922" }));

    expect(generateInvoiceSpy).toHaveBeenCalledWith(
      1,
      ComplianceInvoiceTypes.OBLIGATION,
    );
  });
});
