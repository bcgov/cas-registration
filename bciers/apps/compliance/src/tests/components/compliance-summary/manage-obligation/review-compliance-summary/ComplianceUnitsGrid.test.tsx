import { render, screen, within, fireEvent } from "@testing-library/react";
import { ComplianceUnitsGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceUnitsGrid";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import { ComplianceUnitsProps } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceUnitsGrid";

const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockValue: ComplianceUnitsProps = {
  complianceSummaryId: "123",
  appliedComplianceUnits: [
    {
      id: "1",
      type: "Offset Units",
      serial_number: "BC-123-456",
      vintage_year: "2024",
      quantity_applied: 100,
      equivalent_value: 8000,
    },
    {
      id: "2",
      type: "Earned Credits",
      serial_number: "BC-789-012",
      vintage_year: "2023",
      quantity_applied: 50,
      equivalent_value: 4000,
    },
  ],
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
      "Quantity",
      "Equivalent Emission Reduced",
      "Equivalent Value",
    ];
    headers.forEach((header) => {
      expect(screen.getByRole("columnheader", { name: header })).toBeVisible();
    });

    // Check grid data rows
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3); // 1 header row + 2 data rows

    // Check first row content
    const firstRow = rows[1];
    expect(within(firstRow).getByText("Offset Units")).toBeVisible();
    expect(within(firstRow).getByText("BC-123-456")).toBeVisible();
    expect(within(firstRow).getByText("2024")).toBeVisible();
    expect(within(firstRow).getByText("100")).toBeVisible();
    expect(within(firstRow).getByText("100 tCO2e")).toBeVisible();
    expect(within(firstRow).getByText("$8,000.00")).toBeVisible();

    // Check second row content
    const secondRow = rows[2];
    expect(within(secondRow).getByText("Earned Credits")).toBeVisible();
    expect(within(secondRow).getByText("BC-789-012")).toBeVisible();
    expect(within(secondRow).getByText("2023")).toBeVisible();
    expect(within(secondRow).getByText("50")).toBeVisible();
    expect(within(secondRow).getByText("50 tCO2e")).toBeVisible();
    expect(within(secondRow).getByText("$4,000.00")).toBeVisible();

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
