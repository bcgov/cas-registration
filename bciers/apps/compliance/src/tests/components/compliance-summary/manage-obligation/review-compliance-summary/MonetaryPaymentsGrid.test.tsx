import { render, screen } from "@testing-library/react";
import { MonetaryPaymentsGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/MonetaryPaymentsGrid";
import { PaymentsData } from "@/compliance/src/app/types/payments";

vi.mock("@bciers/components/datagrid/DataGrid", () => ({
  default: ({
    columns,
    initialData,
    columnGroupModel,
    hideFooter,
    sx,
  }: any) => (
    <div data-testid="data-grid">
      <div data-testid="columns">{JSON.stringify(columns)}</div>
      <div data-testid="initial-data">{JSON.stringify(initialData)}</div>
      <div data-testid="column-group-model">
        {JSON.stringify(columnGroupModel)}
      </div>
      <div data-testid="hide-footer">{hideFooter.toString()}</div>
      <div data-testid="sx">{JSON.stringify(sx)}</div>
    </div>
  ),
}));

vi.mock("@/compliance/src/app/components/compliance-summary/TitleRow", () => ({
  TitleRow: ({ label }: { label: string }) => (
    <div data-testid="title-row">{label}</div>
  ),
}));

vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/MonetaryPaymentsAlertNote",
  () => ({
    MonetaryPaymentsAlertNote: () => (
      <div data-testid="monetary-payments-alert-note">Alert Note</div>
    ),
  }),
);

describe("MonetaryPaymentsGrid", () => {
  const mockPaymentsData: PaymentsData = {
    rows: [
      {
        id: 1,
        paymentReceivedDate: "2024-03-20",
        paymentAmountApplied: 1000,
        paymentMethod: "Credit Card",
        transactionType: "Payment",
        receiptNumber: "REC-123",
      },
    ],
    row_count: 1,
  };

  it("renders the title row with correct label", () => {
    render(<MonetaryPaymentsGrid data={mockPaymentsData} />);

    const titleRow = screen.getByTestId("title-row");
    expect(titleRow).toBeInTheDocument();
    expect(titleRow).toHaveTextContent("Monetary Payments Made");
  });

  it("renders the alert note when no data is provided", () => {
    render(<MonetaryPaymentsGrid />);

    expect(
      screen.getByTestId("monetary-payments-alert-note"),
    ).toBeInTheDocument();
  });

  it("renders the alert note when data has no rows", () => {
    render(<MonetaryPaymentsGrid data={{ rows: [], row_count: 0 }} />);

    expect(
      screen.getByTestId("monetary-payments-alert-note"),
    ).toBeInTheDocument();
  });

  it("does not render the alert note when data has rows", () => {
    render(<MonetaryPaymentsGrid data={mockPaymentsData} />);

    expect(
      screen.queryByTestId("monetary-payments-alert-note"),
    ).not.toBeInTheDocument();
  });

  it("renders DataGrid with correct props", () => {
    render(<MonetaryPaymentsGrid data={mockPaymentsData} />);

    const dataGrid = screen.getByTestId("data-grid");
    expect(dataGrid).toBeInTheDocument();

    const initialData = JSON.parse(
      screen.getByTestId("initial-data").textContent || "{}",
    );
    expect(initialData).toEqual(mockPaymentsData);

    const hideFooter = screen.getByTestId("hide-footer");
    expect(hideFooter).toHaveTextContent("true");
  });

  it("renders DataGrid with default data when no data is provided", () => {
    render(<MonetaryPaymentsGrid />);

    const initialData = JSON.parse(
      screen.getByTestId("initial-data").textContent || "{}",
    );
    expect(initialData).toEqual({
      rows: [
        {
          id: 1,
          paymentReceivedDate: "-",
          paymentAmountApplied: 0,
          paymentMethod: "-",
          transactionType: "-",
          receiptNumber: "-",
        },
      ],
      row_count: 1,
    });
  });
});
