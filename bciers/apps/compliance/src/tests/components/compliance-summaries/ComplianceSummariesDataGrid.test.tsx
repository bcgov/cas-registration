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
      outstanding_balance: 500,
      status: "Obligation not met",
      penalty_status: "Accruing",
      obligation_id: "24-0001-1-1",
    },
    {
      id: 2,
      operation_name: "Operation 2",
      reporting_year: 2024,
      excess_emissions: 2000,
      outstanding_balance: 1500,
      status: "Obligation fully met",
      penalty_status: "N/A",
      obligation_id: "24-0002-1-1",
    },
    {
      id: 3,
      operation_name: "Operation 3",
      reporting_year: 2024,
      excess_emissions: 0,
      outstanding_balance: 1,
      status: "Earned credits",
      penalty_status: "N/A",
      obligation_id: null,
    },
  ] as ComplianceSummary[],
  row_count: 3,
};

describe("ComplianceSummariesDataGrid component", () => {
  it("renders the ComplianceSummariesDataGrid with initial data", async () => {
    render(
      <ComplianceSummariesDataGrid
        initialData={mockResponse}
        isCasStaff={false}
        actionedECReportVersionIDs={[]}
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

    // Verify search inputs are present
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(7);

    // Verify data displays
    const summaryRows = screen.getAllByRole("row");
    expect(summaryRows).toHaveLength(5); // 1 header row + 1 filter row + 3 data rows

    // Check first row - Obligation not met
    const firstRow = summaryRows[2];
    expect(within(firstRow).getByText("Operation 1")).toBeVisible();
    expect(within(firstRow).getByText("2024")).toBeVisible();
    expect(within(firstRow).getByText("1000 tCO2e")).toBeVisible();
    expect(within(firstRow).getByText("500 tCO2e")).toBeVisible();
    expect(within(firstRow).getByText("Obligation not met")).toBeVisible();
    expect(within(firstRow).getByText("Accruing")).toBeVisible();
    expect(within(firstRow).getByText("24-0001-1-1")).toBeVisible();
    expect(
      within(firstRow).getByRole("link", { name: "Manage Obligation" }),
    ).toBeVisible();
    expect(
      within(firstRow).getByRole("link", { name: "Manage Obligation" }),
    ).toHaveAttribute(
      "href",
      "/compliance-summaries/1/manage-obligation-review-summary",
    );

    // Check second row - Obligation fully met
    const secondRow = summaryRows[3];
    expect(within(secondRow).getByText("Operation 2")).toBeVisible();
    expect(within(secondRow).getByText("2024")).toBeVisible();
    expect(within(secondRow).getByText("2000 tCO2e")).toBeVisible();
    expect(within(secondRow).getByText("1500 tCO2e")).toBeVisible();
    expect(within(secondRow).getByText("Obligation fully met")).toBeVisible();
    expect(within(secondRow).getByText("N/A")).toBeVisible();
    expect(within(secondRow).getByText("24-0002-1-1")).toBeVisible();
    expect(
      within(secondRow).getByRole("link", { name: "Manage Obligation" }),
    ).toBeVisible();
    expect(
      within(secondRow).getByRole("link", { name: "Manage Obligation" }),
    ).toHaveAttribute(
      "href",
      "/compliance-summaries/2/manage-obligation-review-summary",
    );

    // Check third row - Earned credits
    const thirdRow = summaryRows[4];
    expect(within(thirdRow).getByText("Operation 3")).toBeVisible();
    expect(within(thirdRow).getByText("2024")).toBeVisible();
    expect(within(thirdRow).getByText("0 tCO2e")).toBeVisible();
    expect(within(thirdRow).getByText("1 tCO2e")).toBeVisible();
    expect(within(thirdRow).getByText("Earned credits")).toBeVisible();
    expect(within(thirdRow).getByText("N/A")).toBeVisible();
    expect(
      within(thirdRow).getByRole("link", {
        name: "Request Issuance of Credits",
      }),
    ).toBeVisible();
    expect(
      within(thirdRow).getByRole("link", {
        name: "Request Issuance of Credits",
      }),
    ).toHaveAttribute(
      "href",
      "/compliance-summaries/3/request-issuance-review-summary",
    );
  });

  it("renders the ComplianceSummariesDataGrid with initial data", async () => {
    render(
      <ComplianceSummariesDataGrid
        initialData={mockResponse}
        isCasStaff={true}
        actionedECReportVersionIDs={[3]}
      />,
    );

    // Verify operator name is present
    expect(
      screen.getByRole("columnheader", { name: "Operator Name" }),
    ).toBeVisible();

    // Verify search inputs are present
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(8);

    // Verify data displays
    const summaryRows = screen.getAllByRole("row");
    expect(summaryRows).toHaveLength(5); // 1 header row + 1 filter row + 3 data rows

    // Check third row - Earned credits
    const thirdRow = summaryRows[4];
    expect(within(thirdRow).getByText("Operation 3")).toBeVisible();
    expect(within(thirdRow).getByText("2024")).toBeVisible();
    expect(within(thirdRow).getByText("0 tCO2e")).toBeVisible();
    expect(within(thirdRow).getByText("1 tCO2e")).toBeVisible();
    expect(within(thirdRow).getByText("Earned credits")).toBeVisible();
    expect(within(thirdRow).getByText("N/A")).toBeVisible();
    expect(
      within(thirdRow).getByRole("link", {
        name: "Review Credits Issuance Request",
      }),
    ).toBeVisible();
    expect(
      within(thirdRow).getByRole("link", {
        name: "Review Credits Issuance Request",
      }),
    ).toHaveAttribute(
      "href",
      "/compliance-summaries/3/request-issuance-of-earned-credits",
    );
  });
});
