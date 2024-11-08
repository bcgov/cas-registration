import React from "react";
import { render, screen } from "@testing-library/react";
import FacilityEmissionSummary from "@reporting/src/app/components/facility/FacilityEmissionSummary";
import { vi, Mock } from "vitest"; // If you are using Vitest for mocking

import { actionHandler } from "@bciers/actions";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const mockSummaryData = {
  attributableForReporting: "777",
  attributableForReportingThreshold: "888",
  reportingOnlyEmission: "999",
  emissionCategories: {
    flaring: "500",
    fugitive: "1000",
    industrialProcess: "1500",
    onSiteTransportation: "2000",
    stationaryCombustion: "2500",
    ventingUseful: "3000",
    ventingNonUseful: "3500",
    waste: "4000",
    wastewater: "4500",
  },
  fuelExcluded: {
    woodyBiomass: "100",
    excludedBiomass: "200",
    excludedNonBiomass: "300",
  },
  otherExcluded: {
    lfoExcluded: "400",
    fogExcluded: "0",
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

describe("FacilityEmissionSummary", () => {
  beforeEach(() => {
    (actionHandler as Mock).mockClear();
  });

  it("should render the basic category summary data", async () => {
    render(
      <FacilityEmissionSummary
        versionId={1}
        facilityId={"00000000-0000-0000-0000-000000000002"}
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
      <FacilityEmissionSummary
        versionId={1}
        facilityId={"00000000-0000-0000-0000-000000000002"}
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
      <FacilityEmissionSummary
        versionId={1}
        facilityId={"00000000-0000-0000-0000-000000000002"}
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
      <FacilityEmissionSummary
        versionId={1}
        facilityId={"00000000-0000-0000-0000-000000000002"}
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
