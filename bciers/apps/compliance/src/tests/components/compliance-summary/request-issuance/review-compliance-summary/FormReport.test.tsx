import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { FormReport } from "../../../../../app/components/compliance-summary/request-issuance/review-compliance-summary/FormReport";

const generateTestId = (prefix: string, label: string) => {
  return `${prefix}-${label.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+$/, "")}`;
};

vi.mock("../../../../../app/components/compliance-summary/InfoRow", () => ({
  InfoRow: ({ label, value, style }: any) => {
    const baseTestId = generateTestId("info-row", label);
    return (
      <div data-testid={baseTestId} style={style}>
        <span data-testid={generateTestId("info-row-label", label)}>
          {label}
        </span>
        <span data-testid={generateTestId("info-row-value", label)}>
          {value}
        </span>
      </div>
    );
  },
}));

vi.mock("../../../../../app/components/compliance-summary/TitleRow", () => ({
  TitleRow: ({ label }: any) => (
    <div data-testid={generateTestId("title-row", label)}>{label}</div>
  ),
}));

describe("FormReport", () => {
  const mockData = {
    reporting_year: 2024,
    emissions_attributable_for_compliance: 1000,
    emission_limit: 800,
    excess_emissions: 200,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title row with the correct year", () => {
    render(<FormReport data={mockData} />);

    const titleRow = screen.getByTestId("title-row-From-2024-Report");
    expect(titleRow).toBeInTheDocument();
    expect(titleRow).toHaveTextContent("From 2024 Report");
  });

  it("displays emissions attributable for compliance correctly", () => {
    render(<FormReport data={mockData} />);

    const label = screen.getByTestId(
      "info-row-label-Emissions-Attributable-for-Compliance",
    );
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Emissions Attributable for Compliance:");

    const value = screen.getByTestId(
      "info-row-value-Emissions-Attributable-for-Compliance",
    );
    expect(value).toBeInTheDocument();
    expect(value).toHaveTextContent("1000 tCO2e");
  });

  it("displays emissions limit correctly", () => {
    render(<FormReport data={mockData} />);

    const label = screen.getByTestId("info-row-label-Emissions-Limit");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Emissions Limit:");

    const value = screen.getByTestId("info-row-value-Emissions-Limit");
    expect(value).toBeInTheDocument();
    expect(value).toHaveTextContent("800 tCO2e");
  });

  it("displays excess emissions correctly with bottom margin style", () => {
    render(<FormReport data={mockData} />);

    const label = screen.getByTestId("info-row-label-Excess-Emissions");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Excess Emissions:");

    const value = screen.getByTestId("info-row-value-Excess-Emissions");
    expect(value).toBeInTheDocument();
    expect(value).toHaveTextContent("200 tCO2e");

    const infoRow = screen.getByTestId("info-row-Excess-Emissions");
    expect(infoRow).toHaveStyle({ marginBottom: "50px" });
  });

  it("handles missing data gracefully", () => {
    const incompleteData = {
      reporting_year: 2024,
    };

    render(<FormReport data={incompleteData} />);

    expect(
      screen.getByTestId("title-row-From-2024-Report"),
    ).toBeInTheDocument();

    const emissionsValue = screen.getByTestId(
      "info-row-value-Emissions-Attributable-for-Compliance",
    );
    expect(emissionsValue).toHaveTextContent("undefined tCO2e");
  });
});
