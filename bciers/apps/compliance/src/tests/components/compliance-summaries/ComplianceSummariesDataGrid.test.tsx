import { render, screen, within } from "@testing-library/react";
import { useSearchParams } from "@bciers/testConfig/mocks";
import ComplianceSummariesDataGrid from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesDataGrid";
import { ComplianceSummary } from "@/compliance/src/app/types";

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockResponse = {
  rows: [
    {
      id: 1,
      operation_name: "Operation 1",
      reporting_year: 2024,
      excess_emissions: 1000,
      outstanding_balance_tco2e: 500,
      status: "Obligation not met",
      penalty_status: "Accruing",
      obligation_id: "24-0001-1-1",
      invoice_number: "OBI700000",
    },
    {
      id: 2,
      operation_name: "Operation 2",
      reporting_year: 2024,
      excess_emissions: 2000,
      outstanding_balance_tco2e: 1500,
      status: "No obligation or earned credits",
      penalty_status: null,
      obligation_id: null,
    },
    {
      id: 3,
      operation_name: "Operation 3",
      reporting_year: 2024,
      excess_emissions: 0,
      outstanding_balance_tco2e: 1,
      status: "Earned credits",
      penalty_status: null,
      obligation_id: null,
      issuance_status: "Issuance Requested",
    },
    {
      id: 4,
      operation_name: "Operation 4",
      reporting_year: 2024,
      excess_emissions: 0,
      outstanding_balance: 1,
      status: "Earned credits",
      penalty_status: "N/A",
      obligation_id: undefined,
      issuance_status: "Credits Not Issued in BCCR",
    },
    {
      id: 5,
      operation_name: "Operation 5",
      reporting_year: 2024,
      excess_emissions: 0,
      outstanding_balance: 1,
      status: "Earned credits",
      penalty_status: "N/A",
      obligation_id: undefined,
      issuance_status: "Issuance Requested",
    },
    {
      id: 6,
      operation_name: "Operation 6",
      reporting_year: 2024,
      excess_emissions: 0,
      outstanding_balance: 1,
      status: "Earned credits",
      penalty_status: "N/A",
      obligation_id: undefined,
      issuance_status: "Approved",
    },
    {
      id: 7,
      operation_name: "Operation 7",
      reporting_year: 2024,
      excess_emissions: 5000,
      outstanding_balance: 1,
      status: "Obligation not met",
      penalty_status: "N/A",
      obligation_id: "24-0001-1-5",
      issuance_status: "Approved",
    },
    {
      id: 8,
      operation_name: "Operation 8",
      reporting_year: 2024,
      excess_emissions: 0,
      outstanding_balance: 0,
      status: "No obligation or earned credits",
      penalty_status: "NONE",
      obligation_id: null,
    },
  ] as ComplianceSummary[],
  row_count: 7,
};

describe("ComplianceSummariesDataGrid component", () => {
  it("renders the ComplianceSummariesDataGrid with initial data", async () => {
    render(
      <ComplianceSummariesDataGrid
        initialData={mockResponse}
        isAllowedCas={false}
      />,
    );

    // Verify headers are present
    expect(
      screen.getByRole("columnheader", { name: "Operation Name" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Compliance Period" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Excess Emission" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Outstanding Balance" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Compliance Status" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Penalty Status" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Obligation ID" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeVisible();

    // Verify data displays
    const summaryRows = screen.getAllByRole("row");
    expect(summaryRows.length).toBe(9); // header + 8 data rows

    // Check first row - Obligation not met (Operation 1)
    const firstRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 1"),
    );
    expect(firstRow).toBeTruthy();
    expect(within(firstRow!).getByText("2024")).toBeVisible();
    expect(within(firstRow!).getByText("1000 tCO2e")).toBeVisible();
    expect(within(firstRow!).getByText("500 tCO2e")).toBeVisible();
    expect(within(firstRow!).getByText("Obligation - not met")).toBeVisible();
    expect(within(firstRow!).getAllByRole("gridcell")[5]).toHaveTextContent(
      "Accruing",
    );
    expect(within(firstRow!).getByText("24-0001-1-1")).toBeVisible();
    expect(
      within(firstRow!).getByRole("link", { name: "Manage Obligation" }),
    ).toBeVisible();
    expect(
      within(firstRow!).getByRole("link", { name: "Manage Obligation" }),
    ).toHaveAttribute(
      "href",
      "/compliance-summaries/1/manage-obligation-review-summary",
    );

    // Check second row - No obligation or earned credits (Operation 2)
    const secondRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 2"),
    );
    expect(secondRow).toBeTruthy();
    expect(within(secondRow!).getByText("2024")).toBeVisible();
    expect(within(secondRow!).getByText("2000 tCO2e")).toBeVisible();
    expect(within(secondRow!).getByText("1500 tCO2e")).toBeVisible();
    expect(
      within(secondRow!).getByText("No obligation or earned credits"),
    ).toBeVisible();
    expect(within(secondRow!).getAllByRole("gridcell")[5]).toHaveTextContent(
      "N/A",
    );
    expect(within(secondRow!).getAllByRole("gridcell")[6]).toHaveTextContent(
      "N/A",
    );
    expect(
      within(secondRow!).getByRole("link", { name: "View Details" }),
    ).toBeVisible();
    expect(
      within(secondRow!).getByRole("link", { name: "View Details" }),
    ).toHaveAttribute("href", "/compliance-summaries/2/review-summary");

    // Check third row - Earned credits (Operation 3)
    const thirdRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 3"),
    );
    expect(thirdRow).toBeTruthy();
    expect(within(thirdRow!).getByText("2024")).toBeVisible();
    expect(within(thirdRow!).getByText("0 tCO2e")).toBeVisible();
    expect(within(thirdRow!).getByText("1 tCO2e")).toBeVisible();
    expect(
      within(thirdRow!).getByText("Earned credits - issuance requested"),
    ).toBeVisible();
    expect(within(thirdRow!).getAllByRole("gridcell")[5]).toHaveTextContent(
      "N/A",
    );
    expect(within(thirdRow!).getAllByRole("gridcell")[6]).toHaveTextContent(
      "N/A",
    );
    expect(
      within(thirdRow!).getByRole("link", {
        name: "View Details",
      }),
    ).toBeVisible();
    expect(
      within(thirdRow!).getByRole("link", {
        name: "View Details",
      }),
    ).toHaveAttribute(
      "href",
      "/compliance-summaries/3/request-issuance-review-summary",
    );

    // Check fourth row - Earned credits, not requested (Operation 4)
    const fourthRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 4"),
    );
    expect(fourthRow).toBeTruthy();
    expect(
      within(fourthRow!).getByText("Earned credits - not requested"),
    ).toBeVisible();
    expect(within(fourthRow!).getAllByRole("gridcell")[5]).toHaveTextContent(
      "N/A",
    );
    expect(
      within(fourthRow!).getByRole("link", {
        name: "Request Issuance of Credits",
      }),
    ).toBeVisible();
    expect(
      within(fourthRow!).getByRole("link", {
        name: "Request Issuance of Credits",
      }),
    ).toHaveAttribute(
      "href",
      "/compliance-summaries/4/request-issuance-review-summary",
    );

    // Check fifth row - Earned credits, issuance requested (Operation 5)
    const fifthRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 5"),
    );
    expect(fifthRow).toBeTruthy();
    expect(
      within(fifthRow!).getByText("Earned credits - issuance requested"),
    ).toBeVisible();
    expect(within(fifthRow!).getAllByRole("gridcell")[5]).toHaveTextContent(
      "N/A",
    );
    expect(
      within(fifthRow!).getByRole("link", {
        name: "View Details",
      }),
    ).toBeVisible();
    expect(
      within(fifthRow!).getByRole("link", {
        name: "View Details",
      }),
    ).toHaveAttribute(
      "href",
      "/compliance-summaries/5/request-issuance-review-summary",
    );

    // Check sixth row - Earned credits, approved (Operation 6)
    const sixthRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 6"),
    );
    expect(sixthRow).toBeTruthy();
    expect(
      within(sixthRow!).getByText("Earned credits - approved"),
    ).toBeVisible();
    expect(within(sixthRow!).getAllByRole("gridcell")[5]).toHaveTextContent(
      "N/A",
    );

    // Check seventh row - Obligation not met, N/A penalty (Operation 7)
    const seventhRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 7"),
    );
    expect(seventhRow).toBeTruthy();
    expect(within(seventhRow!).getByText("Obligation - not met")).toBeVisible();
    expect(within(seventhRow!).getAllByRole("gridcell")[5]).toHaveTextContent(
      "N/A",
    );

    // Check eighth row - Penalty status is 'NONE' (Operation 8)
    const eighthRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 8"),
    );
    expect(eighthRow).toBeTruthy();
    expect(within(eighthRow!).getAllByRole("gridcell")[5]).toHaveTextContent(
      "N/A",
    );
  });

  it("shows 'View Details' for external users once the request has been submitted", async () => {
    render(
      <ComplianceSummariesDataGrid
        initialData={mockResponse}
        isAllowedCas={false}
      />,
    );
    const summaryRows = screen.getAllByRole("row");
    const dataRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 4"),
    );
    expect(dataRow).toBeTruthy();
    expect(
      within(dataRow!).getByRole("link", {
        name: "Request Issuance of Credits",
      }),
    ).toBeVisible();
    expect(
      within(dataRow!).getByRole("link", {
        name: "Request Issuance of Credits",
      }),
    ).toHaveAttribute(
      "href",
      "/compliance-summaries/4/request-issuance-review-summary",
    );
  });

  it("shows 'Review Credits Issuance Request' for internal users when no decision has been made yet", async () => {
    render(
      <ComplianceSummariesDataGrid
        initialData={mockResponse}
        isAllowedCas={true}
      />,
    );
    const summaryRows = screen.getAllByRole("row");
    const dataRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 5"),
    );
    expect(dataRow).toBeTruthy();
    expect(
      within(dataRow!).getByRole("link", {
        name: "Review Credits Issuance Request",
      }),
    ).toBeVisible();
    expect(
      within(dataRow!).getByRole("link", {
        name: "Review Credits Issuance Request",
      }),
    ).toHaveAttribute(
      "href",
      "/compliance-summaries/5/request-issuance-review-summary",
    );
  });

  it("shows 'View Details' for internal users when there's a final decision (APPROVED/DECLINED)", async () => {
    render(
      <ComplianceSummariesDataGrid
        initialData={mockResponse}
        isAllowedCas={true}
      />,
    );
    const summaryRows = screen.getAllByRole("row");
    const dataRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 6"),
    );
    expect(dataRow).toBeTruthy();
    expect(
      within(dataRow!).getByRole("link", { name: "View Details" }),
    ).toBeVisible();
    expect(
      within(dataRow!).getByRole("link", { name: "View Details" }),
    ).toHaveAttribute(
      "href",
      "/compliance-summaries/6/track-status-of-issuance",
    );
  });

  it("shows 'View Details' for external users when no decision has been made yet", async () => {
    render(
      <ComplianceSummariesDataGrid
        initialData={mockResponse}
        isAllowedCas={false}
      />,
    );
    const summaryRows = screen.getAllByRole("row");
    const dataRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 5"),
    );
    expect(dataRow).toBeTruthy();
    expect(
      within(dataRow!).getByRole("link", {
        name: "View Details",
      }),
    ).toBeVisible();
    expect(
      within(dataRow!).getByRole("link", {
        name: "View Details",
      }),
    ).toHaveAttribute(
      "href",
      "/compliance-summaries/5/request-issuance-review-summary",
    );
  });

  it("shows 'Pending Invoice Creation' when there's no invoice_number", async () => {
    render(
      <ComplianceSummariesDataGrid
        initialData={mockResponse}
        isAllowedCas={false}
      />,
    );
    const summaryRows = screen.getAllByRole("row");
    const dataRow = summaryRows.find((row) =>
      within(row).queryByText("Operation 7"),
    );
    expect(dataRow).toBeTruthy();
    expect(
      within(dataRow!).getByRole("link", { name: "Pending Invoice Creation" }),
    ).toBeVisible();
    expect(
      within(dataRow!).getByRole("link", { name: "Pending Invoice Creation" }),
    ).toHaveAttribute("href", "#");
  });
});
