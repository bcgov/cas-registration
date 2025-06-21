import { render, screen } from "@testing-library/react";
import OperationEmissionSummary from "./OperationEmissionSummaryForm";
import { describe, it, expect } from "vitest";
import { useRouter } from "@bciers/testConfig/mocks";

useRouter.mockReturnValue({
  refresh: vi.fn(),
});

const mockNavigationInformation = {
  taskList: [
    {
      type: "Page",
      title: "Additional reporting data",
      link: "/reports/7/additional-reporting-data",
      isActive: false,
    },
    {
      type: "Page",
      title: "Operation emission summary",
      isActive: true,
      link: "/reports/7/operation-emission-summary",
    },
  ],
  backUrl: "/reports/7/additional-reporting-data",
  continueUrl: "/reports/7/compliance-summary",
  headerSteps: [
    "Operation Information",
    "Report Information",
    "Additional Information",
    "Compliance Summary",
    "Sign-off & Submit",
  ],
  headerStepIndex: 2,
};

const mockSummaryFormData = {
  attributable_for_reporting: "1866666648.0000",
  attributable_for_reporting_threshold: "0.0000",
  reporting_only_emission: "1866666648.0000",
  emission_categories: {
    flaring: "0",
    fugitive: "0",
    industrial_process: "0",
    onsite_transportation: "0",
    stationary_combustion: "1866666648.0000",
    venting_useful: "0",
    venting_non_useful: "0",
    waste: "0",
    wastewater: "0",
  },
  fuel_excluded: {
    woody_biomass: "1866666648.0000",
    excluded_biomass: "0",
    excluded_non_biomass: "0",
  },
  other_excluded: {
    lfo_excluded: "0",
    fog_excluded: 0,
  },
};

describe("OperationEmissionSummary", () => {
  it("renders the component with numbers correctly displayed", () => {
    render(
      <OperationEmissionSummary
        summaryFormData={mockSummaryFormData}
        navigationInformation={mockNavigationInformation}
      />,
    );
    const attributeEmissions = screen.getAllByLabelText(
      /Emissions attributable for reporting/i,
    );
    expect(attributeEmissions[0]).toHaveValue("1,866,666,648.0000");
  });
});
