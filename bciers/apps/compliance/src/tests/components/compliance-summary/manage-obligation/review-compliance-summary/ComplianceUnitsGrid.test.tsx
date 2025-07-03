import { render, screen, within, fireEvent } from "@testing-library/react";
import { ComplianceUnitsGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceUnitsGrid";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import type { ComplianceAppliedUnitsSummary } from "@/compliance/src/app/types";

// Mocks
const mockRouterPush = vi.fn();

useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockValue: ComplianceAppliedUnitsSummary = {
  compliance_report_version_id: "123",
  applied_compliance_units: {
    row_count: 2,
    rows: [
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
  },
};

describe("ComplianceUnitsGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders alert note and data grid", () => {
    render(<ComplianceUnitsGrid value={mockValue} />);

    // Alert note
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("You may use compliance units");
    expect(
      within(alert).getByRole("link", { name: /b\.c\. carbon registry/i }),
    ).toBeVisible();

    // Headers
    const headers = [
      "Type",
      "Serial Number",
      "Vintage Year",
      "Quantity",
      "Equivalent Emission Reduced",
      "Equivalent Value",
    ];
    headers.forEach((header) => {
      expect(
        screen.getByRole("columnheader", { name: header }),
      ).toBeInTheDocument();
    });

    // Data rows
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3); // header + 2 data rows

    const [_, firstRow, secondRow] = rows;

    within(firstRow).getByText("Offset Units");
    within(firstRow).getByText("BC-123-456");
    within(firstRow).getByText("2024");
    within(firstRow).getByText("100");
    within(firstRow).getByText("100 tCO2e");
    within(firstRow).getByText("$8,000.00");

    within(secondRow).getByText("Earned Credits");
    within(secondRow).getByText("BC-789-012");
    within(secondRow).getByText("2023");
    within(secondRow).getByText("50");
    within(secondRow).getByText("50 tCO2e");
    within(secondRow).getByText("$4,000.00");
  });

  it("navigates to apply page when button is clicked", () => {
    render(<ComplianceUnitsGrid value={mockValue} />);
    const applyButton = screen.getByRole("button", {
      name: /apply compliance units/i,
    });

    fireEvent.click(applyButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/compliance-summaries/123/apply-compliance-units",
    );
  });

  it("renders the BCCR link correctly", () => {
    render(<ComplianceUnitsGrid value={mockValue} />);
    const link = screen.getByRole("link", {
      name: /b\.c\. carbon registry/i,
    });

    expect(link).toHaveAttribute(
      "href",
      "https://carbonregistry.gov.bc.ca/bccarbonregistry",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
