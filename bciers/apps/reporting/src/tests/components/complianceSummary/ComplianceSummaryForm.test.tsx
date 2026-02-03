import { fireEvent, render, screen } from "@testing-library/react";
import ComplianceSummaryForm from "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm";
import { vi, Mock } from "vitest"; // If you are using Vitest for mocking

import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";
import { dummyNavigationInformation } from "../taskList/utils";
import { createComplianceSummarySchema } from "@reporting/src/data/jsonSchema/complianceSummary";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

const mockSummaryData = {
  emissions_attributable_for_reporting: "1000.5",
  reporting_only_emissions: "2000.75",
  emissions_attributable_for_compliance: "3000.25",
  emissions_limit: "4000",
  excess_emissions: "5000.5",
  credited_emissions: "6000.75",
  regulatory_values: {
    initial_compliance_period: "2024",
    compliance_period: "2024",
  },
  products: [
    {
      name: "Pucks",
      customUnit: "Goals",
      reduction_factor: "7000.1",
      tightening_rate: "8000.2",
      annual_production: "11000.5",
      apr_dec_production: "12000.6",
      emission_intensity: "13000.7",
      allocated_industrial_process_emissions: "14000.8",
      allocated_compliance_emissions: "15000.9",
    },
  ],
  reporting_year: 2024,
};

describe("ComplianceSummaryForm", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
    (actionHandler as Mock).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the calculation summary data", async () => {
    render(
      <ComplianceSummaryForm
        summaryFormData={mockSummaryData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    expect(
      screen.getByLabelText("Emissions attributable for reporting").value,
    ).toBe("1,000.5");
    expect(screen.getByLabelText("Reporting-only emissions").value).toBe(
      "2,000.75",
    );
    expect(screen.getByLabelText("Emissions limit").value).toBe("4,000");
    expect(screen.getByLabelText("Excess emissions").value).toBe("5,000.5");
    expect(screen.getByLabelText("Credited emissions").value).toBe("6,000.75");
  });

  it("should render the regulatory values summary data", async () => {
    render(
      <ComplianceSummaryForm
        summaryFormData={mockSummaryData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    expect(screen.getByLabelText("Initial compliance period").value).toBe(
      "2024",
    );
    expect(screen.getByLabelText("Compliance period").value).toBe("2024");
  });

  it("should render the production summary data", async () => {
    render(
      <ComplianceSummaryForm
        summaryFormData={mockSummaryData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    expect(screen.getByLabelText("Reduction factor").value).toBe("7,000.1");
    expect(screen.getByLabelText("Tightening rate").value).toBe("8,000.2");
    expect(screen.getByLabelText("Annual production").value).toBe("11,000.5");
    expect(
      screen.getByLabelText("Production-weighted average emission intensity")
        .value,
    ).toBe("13,000.7");
    expect(
      screen.getByLabelText("Allocated industrial process emissions").value,
    ).toBe("14,000.8");
    expect(
      screen.getByLabelText("Allocated Emissions attributable to compliance")
        .value,
    ).toBe("15,000.9");
  });

  it("should render a back button that navigates to the additional information page", async () => {
    render(
      <ComplianceSummaryForm
        summaryFormData={mockSummaryData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const button = screen.getByRole("button", { name: /back/i });

    expect(button).toBeVisible();

    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith("back");
  });

  it("should render a continue button that navigates to the final review page", async () => {
    render(
      <ComplianceSummaryForm
        summaryFormData={mockSummaryData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const button = screen.getByRole("button", {
      name: /Continue/i,
    });

    expect(button).toBeVisible();

    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith("continue");
  });

  it("should show apr_dec_production field for year 2024", async () => {
    render(
      <ComplianceSummaryForm
        summaryFormData={mockSummaryData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    expect(screen.getByLabelText("apr_dec_production")).toBeInTheDocument();
  });

  it("should not show apr_dec_production field for years other than 2024", async () => {
    const mock2025Data = {
      emissions_attributable_for_reporting: "1000.5",
      reporting_only_emissions: "2000.75",
      emissions_attributable_for_compliance: "3000.25",
      emissions_limit: "4000",
      excess_emissions: "5000.5",
      credited_emissions: "6000.75",
      regulatory_values: {
        initial_compliance_period: "2025",
        compliance_period: "2025",
      },
      products: [
        {
          name: "Pucks",
          customUnit: "Goals",
          reduction_factor: "7000.1",
          tightening_rate: "8000.2",
          annual_production: "11000.5",
          // apr_dec_production should not exist for non-2024 years
          emission_intensity: "13000.7",
          allocated_industrial_process_emissions: "14000.8",
          allocated_compliance_emissions: "15000.9",
        },
      ],
      reporting_year: 2025,
    };

    render(
      <ComplianceSummaryForm
        summaryFormData={mock2025Data}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    expect(
      screen.queryByLabelText("apr_dec_production"),
    ).not.toBeInTheDocument();
  });

  it("should generate schema without apr_dec_production for non-2024 years", () => {
    const schema2025 = createComplianceSummarySchema(2025);
    const productsSchema = schema2025.properties?.products as any;
    const productProperties = productsSchema?.items?.properties;

    expect(productProperties).toBeDefined();
    expect(productProperties?.apr_dec_production).toBeUndefined();
    expect(productProperties?.annual_production).toBeDefined();
  });

  it("should generate schema with apr_dec_production for 2024", () => {
    const schema2024 = createComplianceSummarySchema(2024);
    const productsSchema = schema2024.properties?.products as any;
    const productProperties = productsSchema?.items?.properties;

    expect(productProperties).toBeDefined();
    expect(productProperties?.apr_dec_production).toBeDefined();
    expect(productProperties?.annual_production).toBeDefined();
  });
});
