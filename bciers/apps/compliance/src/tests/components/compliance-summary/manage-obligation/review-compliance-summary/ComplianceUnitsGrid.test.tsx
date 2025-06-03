import { render, screen, within, fireEvent } from "@testing-library/react";
import { ComplianceUnitsGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceUnitsGrid";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";

const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockValue = {
  complianceSummaryId: "123",
  gridData: {
    rows: [
      {
        id: 1,
        type: "Offset Units",
        serialNumber: "BC-123-456",
        vintageYear: "2024",
        quantityApplied: "100",
        equivalentEmissionReduced: "200",
        equivalentValue: "8000",
        status: "Applied",
      },
      {
        id: 2,
        type: "Earned Credits",
        serialNumber: "BC-789-012",
        vintageYear: "2023",
        quantityApplied: "50",
        equivalentEmissionReduced: "60",
        equivalentValue: "4000",
        status: "Applied",
      },
    ],
    row_count: 2,
  },
};

describe("ComplianceUnitsGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the grid with compliance units data", () => {
    render(<ComplianceUnitsGrid value={mockValue} />);

    // Check alert note content
    const alertNote = screen.getByRole("alert");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent("You may use compliance units");
    expect(
      within(alertNote).getByRole("link", {
        name: "B.C. Carbon Registry (BCCR)",
      }),
    ).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "You may use compliance units (earned credits, offset units) you hold in the B.C. Carbon Registry (BCCR) to meet up to 50% of the compliance obligation below. The remaining balance must be met with monetary payment(s)",
    );

    // Check grid headers
    const headers = [
      "Type",
      "Serial Number",
      "Vintage Year",
      "Quantity Applied",
      "Equivalent Emission Reduced",
      "Equivalent Value",
      "Status",
    ];
    headers.forEach((header) => {
      expect(screen.getByRole("columnheader", { name: header })).toBeVisible();
    });

    // Verify search inputs are present
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(3);

    // Check grid data rows
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(4); // 1 header row + 1 filter row + 2 data rows

    // Check first row content
    const firstRow = rows[2];
    expect(within(firstRow).getByText("Offset Units")).toBeVisible();
    expect(within(firstRow).getByText("BC-123-456")).toBeVisible();
    expect(within(firstRow).getByText("2024")).toBeVisible();
    expect(within(firstRow).getByText("100")).toBeVisible();
    expect(within(firstRow).getByText("200 tCO2e")).toBeVisible();
    expect(within(firstRow).getByText("$8,000.00")).toBeVisible();
    expect(within(firstRow).getByText("Applied")).toBeVisible();

    // Check second row content
    const secondRow = rows[3];
    expect(within(secondRow).getByText("Earned Credits")).toBeVisible();
    expect(within(secondRow).getByText("BC-789-012")).toBeVisible();
    expect(within(secondRow).getByText("2023")).toBeVisible();
    expect(within(secondRow).getByText("50")).toBeVisible();
    expect(within(secondRow).getByText("60 tCO2e")).toBeVisible();
    expect(within(secondRow).getByText("$4,000.00")).toBeVisible();
    expect(within(secondRow).getByText("Applied")).toBeVisible();

    // Check Apply Compliance Units button
    const applyButton = screen.getByRole("button", {
      name: "Apply Compliance Units",
    });
    expect(applyButton).toBeVisible();
    expect(applyButton).toBeEnabled();
  });

  it("navigates to apply compliance units page when button is clicked", () => {
    render(<ComplianceUnitsGrid value={mockValue} />);

    const applyButton = screen.getByRole("button", {
      name: "Apply Compliance Units",
    });
    fireEvent.click(applyButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/compliance-summaries/123/apply-compliance-units",
    );
  });

  it("renders BCCR link with correct attributes", () => {
    render(<ComplianceUnitsGrid value={mockValue} />);

    const bccrLink = screen.getByRole("link", {
      name: "B.C. Carbon Registry (BCCR)",
    });
    expect(bccrLink).toBeVisible();
    expect(bccrLink).toHaveAttribute(
      "href",
      "https://carbonregistry.gov.bc.ca/bccarbonregistry",
    );
    expect(bccrLink).toHaveAttribute("target", "_blank");
    expect(bccrLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
