import { render, screen } from "@testing-library/react";
import FacilityEmissionSummaryForm from "@reporting/src/app/components/facility/FacilityEmissionSummaryForm";
import { vi, Mock } from "vitest"; // If you are using Vitest for mocking

import { actionHandler } from "@bciers/actions";
import { dummyNavigationInformation } from "../taskList/utils";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const mockSummaryData = {
  attributable_for_reporting: "777",
  attributable_for_reporting_threshold: "888",
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

describe("FacilityEmissionSummaryForm", () => {
  beforeEach(() => {
    (actionHandler as Mock).mockClear();
  });

  it("should render the basic category summary data", async () => {
    render(
      <FacilityEmissionSummaryForm
        summaryFormData={mockSummaryData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    expect(
      screen.getByLabelText<HTMLInputElement>("Flaring emissions").value,
    ).toBe("500");
    expect(
      screen.getByLabelText<HTMLInputElement>("Fugitive emissions").value,
    ).toBe("1,000");
    expect(
      screen.getByLabelText<HTMLInputElement>("Industrial process emissions")
        .value,
    ).toBe("1,500");
    expect(
      screen.getByLabelText<HTMLInputElement>(
        "On-site transportation emissions",
      ).value,
    ).toBe("2,000");
    expect(
      screen.getByLabelText<HTMLInputElement>(
        "Stationary fuel combustion emissions",
      ).value,
    ).toBe("2,500");
    expect(
      screen.getByLabelText<HTMLInputElement>("Venting emissions - useful")
        .value,
    ).toBe("3,000");
    expect(
      screen.getByLabelText<HTMLInputElement>("Venting emissions - non-useful")
        .value,
    ).toBe("3,500");
    expect(
      screen.getByLabelText<HTMLInputElement>("Emissions from waste").value,
    ).toBe("4,000");
    expect(
      screen.getByLabelText<HTMLInputElement>("Emissions from wastewater")
        .value,
    ).toBe("4,500");
  });

  it("should render the fuel excluded category summary data", async () => {
    render(
      <FacilityEmissionSummaryForm
        summaryFormData={mockSummaryData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    expect(
      screen.getByLabelText<HTMLInputElement>(
        "CO2 emissions from excluded woody biomass",
      ).value,
    ).toBe("100");
    expect(
      screen.getByLabelText<HTMLInputElement>(
        "Other emissions from excluded biomass",
      ).value,
    ).toBe("200");
    expect(
      screen.getByLabelText<HTMLInputElement>(
        "Emissions from excluded non-biomass",
      ).value,
    ).toBe("300");
  });

  it("should render the other excluded category summary data", async () => {
    render(
      <FacilityEmissionSummaryForm
        summaryFormData={mockSummaryData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    expect(
      screen.getByLabelText<HTMLInputElement>(
        "Emissions from line tracing and non-processing and non-compression activities",
      ).value,
    ).toBe("400");
  });

  it("should render the attributable summary data", async () => {
    render(
      <FacilityEmissionSummaryForm
        summaryFormData={mockSummaryData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    expect(
      screen.getByLabelText<HTMLInputElement>(
        "Emissions attributable for reporting",
      ).value,
    ).toBe("777");
    expect(
      screen.getByLabelText<HTMLInputElement>(
        "Emissions attributable for reporting threshold",
      ).value,
    ).toBe("888");
  });
});
