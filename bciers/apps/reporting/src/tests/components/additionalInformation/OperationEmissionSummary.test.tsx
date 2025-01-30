import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, Mock } from "vitest"; // If you are using Vitest for mocking

import { actionHandler } from "@bciers/actions";
import OperationEmissionSummary from "@reporting/src/app/components/additionalInformation/operationEmissionSummary/OperationEmissionSummaryForm";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const mockSummaryData = {
  attributable_for_reporting: "777",
  attributable_for_reporting_threshold: "888",
  reporting_only_emission: "999",
  emission_categories: {
    flaring: "500",
    fugitive: "1000",
    industrial_process: "1500",
    onsite_transportation: "2000",
    stationary_combustion: "2500",
    venting_useful: "3000",
    venting_non_useful: "3500",
    waste: "4000",
    wastewater: "4500",
  },
  fuel_excluded: {
    woody_biomass: "100",
    excluded_biomass: "200",
    excluded_non_biomass: "300",
  },
  other_excluded: {
    lfo_excluded: "400",
    fog_excluded: "0",
  },
};

beforeEach(() => {
  window.alert = vi.fn(); // or vi.fn() if using Vitest
  vi.mock("next/navigation", () => {
    const actual = vi.importActual("next/navigation");
    return {
      ...actual,
      useRouter: vi.fn(() => ({
        push: vi.fn(),
      })),
      useSearchParams: vi.fn(() => ({
        get: vi.fn(),
      })),
      usePathname: vi.fn(),
    };
  });
});

describe("OperationEmissionSummary", () => {
  beforeEach(() => {
    (actionHandler as Mock).mockClear();
  });

  it("should render the basic category summary data", async () => {
    render(
      <OperationEmissionSummary
        versionId={1}
        summaryFormData={mockSummaryData}
        taskListElements={[]}
      />,
    );

    expect(screen.getByLabelText("Flaring emissions").value).toBe("500");
    expect(screen.getByLabelText("Fugitive emissions").value).toBe("1000");
    expect(screen.getByLabelText("Industrial process emissions").value).toBe(
      "1500",
    );
    expect(
      screen.getByLabelText("On-site transportation emissions").value,
    ).toBe("2000");
    expect(
      screen.getByLabelText("Stationary fuel combustion emissions").value,
    ).toBe("2500");
    expect(screen.getByLabelText("Venting emissions - useful").value).toBe(
      "3000",
    );
    expect(screen.getByLabelText("Venting emissions - non-useful").value).toBe(
      "3500",
    );
    expect(screen.getByLabelText("Emissions from waste").value).toBe("4000");
    expect(screen.getByLabelText("Emissions from wastewater").value).toBe(
      "4500",
    );
  });

  it("should render the fuel excluded category summary data", async () => {
    render(
      <OperationEmissionSummary
        versionId={1}
        summaryFormData={mockSummaryData}
        taskListElements={[]}
      />,
    );

    expect(
      screen.getByLabelText("CO2 emissions from excluded woody biomass").value,
    ).toBe("100");
    expect(
      screen.getByLabelText("Other emissions from excluded biomass").value,
    ).toBe("200");
    expect(
      screen.getByLabelText("Emissions from excluded non-biomass").value,
    ).toBe("300");
  });

  it("should render the other excluded category summary data", async () => {
    render(
      <OperationEmissionSummary
        versionId={1}
        summaryFormData={mockSummaryData}
        taskListElements={[]}
      />,
    );

    expect(
      screen.getByLabelText(
        "Emissions from line tracing and non-processing and non-compression activities",
      ).value,
    ).toBe("400");
    expect(
      screen.getByLabelText(
        "Emissions from fat, oil and grease collection, refining and storage",
      ).value,
    ).toBe("0");
  });

  it("should render the attributable summary data", async () => {
    render(
      <OperationEmissionSummary
        versionId={1}
        summaryFormData={mockSummaryData}
        taskListElements={[]}
      />,
    );

    expect(
      screen.getByLabelText("Emissions attributable for reporting").value,
    ).toBe("777");
    expect(
      screen.getByLabelText("Emissions attributable for reporting threshold")
        .value,
    ).toBe("888");
    expect(screen.getByLabelText("Reporting-only emissions").value).toBe("999");
  });
});
