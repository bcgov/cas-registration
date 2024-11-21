import React from "react";
import { render, screen } from "@testing-library/react";
import ComplianceSummary from "@reporting/src/app/components/complianceSummary/ComplianceSummary";
import { vi, Mock } from "vitest"; // If you are using Vitest for mocking

import { actionHandler } from "@bciers/actions";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const mockSummaryData = {
  attributableForReporting: "1000",
  reportingOnlyEmission: "1000",
  emissionsLimit: "1000",
  excessEmissions: "1000",
  creditedEmissions: "1000",
  regulatoryValues: {
    reductionFactor: "1000",
    tighteningRate: "1000",
    initialCompliancePeriod: "1000",
    compliancePeriod: "1000",
  },
  products: [
    {
      name: "Pucks",
      customUnit: "Goals",
      annualProduction: "1000",
      emissionIntensity: "1000",
      allocatedIndustrialProcessEmissions: "1000",
      allocatedComplianceEmissions: "1000",
    },
  ],
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

describe("ComplianceSummary", () => {
  beforeEach(() => {
    (actionHandler as Mock).mockClear();
  });

  it("should render the calculation summary data", async () => {
    render(
      <ComplianceSummary
        versionId={1}
        summaryFormData={mockSummaryData}
        taskListElements={[]}
      />,
    );

    expect(
      screen.getByLabelText("Emissions attributable for reporting").value,
    ).toBe("1000");
    expect(screen.getByLabelText("Reporting-only emissions").value).toBe(
      "1000",
    );
    expect(screen.getByLabelText("Emissions limit").value).toBe("1000");
    expect(screen.getByLabelText("Excess emissions").value).toBe("1000");
    expect(screen.getByLabelText("Credited emissions").value).toBe("1000");
  });

  it("should render the regulatory values summary data", async () => {
    render(
      <ComplianceSummary
        versionId={1}
        summaryFormData={mockSummaryData}
        taskListElements={[]}
      />,
    );

    expect(screen.getByLabelText("Reduction factor").value).toBe("1000");
    expect(screen.getByLabelText("Tightening rate").value).toBe("1000");
    expect(screen.getByLabelText("Initial compliance period").value).toBe(
      "1000",
    );
    expect(screen.getByLabelText("Compliance period").value).toBe("1000");
  });

  it("should render the production summary data", async () => {
    render(
      <ComplianceSummary
        versionId={1}
        summaryFormData={mockSummaryData}
        taskListElements={[]}
      />,
    );

    expect(screen.getByLabelText("Annual production").value).toBe("1000");
    expect(
      screen.getByLabelText("Weighted average emission intensity").value,
    ).toBe("1000");
    expect(
      screen.getByLabelText("Emissions allocated to industrial process").value,
    ).toBe("1000");
    expect(
      screen.getByLabelText("Emissions allocated to compliance").value,
    ).toBe("1000");
  });

  it("should render a back button that navigates to the additional information page", async () => {
    render(
      <ComplianceSummary
        versionId={1}
        summaryFormData={mockSummaryData}
        taskListElements={[]}
      />,
    );

    expect(
      screen.getByRole("link", {
        name: /back/i,
      }),
    ).toHaveAttribute("href", "/reports/1/additional-reporting-data");
  });

  it("should render a continue button that navigates to the signoff page", async () => {
    render(
      <ComplianceSummary
        versionId={1}
        summaryFormData={mockSummaryData}
        taskListElements={[]}
      />,
    );

    expect(
      screen.getByRole("link", {
        name: /continue/i,
      }),
    ).toHaveAttribute("href", "/reports/1/sign-off");
  });
});
