import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ComplianceSummaryForm from "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm";
import { vi, Mock } from "vitest"; // If you are using Vitest for mocking

import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
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

  // it("should render the calculation summary data", async () => {
  //   render(
  //     <ComplianceSummary
  //       versionId={1}
  //       summaryFormData={mockSummaryData}
  //       taskListElements={[]}
  //     />,
  //   );

  //   expect(
  //     screen.getByLabelText("Emissions attributable for reporting").value,
  //   ).toBe("1000");
  //   expect(screen.getByLabelText("Reporting-only emissions").value).toBe(
  //     "1000",
  //   );
  //   expect(screen.getByLabelText("Emissions limit").value).toBe("1000");
  //   expect(screen.getByLabelText("Excess emissions").value).toBe("1000");
  //   expect(screen.getByLabelText("Credited emissions").value).toBe("1000");
  // });

  // it("should render the regulatory values summary data", async () => {
  //   render(
  //     <ComplianceSummary
  //       versionId={1}
  //       summaryFormData={mockSummaryData}
  //       taskListElements={[]}
  //     />,
  //   );

  //   expect(screen.getByLabelText("Reduction factor").value).toBe("1000");
  //   expect(screen.getByLabelText("Tightening rate").value).toBe("1000");
  //   expect(screen.getByLabelText("Initial compliance period").value).toBe(
  //     "1000",
  //   );
  //   expect(screen.getByLabelText("Compliance period").value).toBe("1000");
  // });

  // it("should render the production summary data", async () => {
  //   render(
  //     <ComplianceSummary
  //       versionId={1}
  //       summaryFormData={mockSummaryData}
  //       taskListElements={[]}
  //     />,
  //   );

  //   expect(screen.getByLabelText("Annual production").value).toBe("1000");
  //   expect(
  //     screen.getByLabelText("Weighted average emission intensity").value,
  //   ).toBe("1000");
  //   expect(
  //     screen.getByLabelText("Emissions allocated to industrial process").value,
  //   ).toBe("1000");
  //   expect(
  //     screen.getByLabelText("Emissions allocated to compliance").value,
  //   ).toBe("1000");
  // });

  it("should render a back button that navigates to the additional information page", async () => {
    render(
      <ComplianceSummaryForm
        versionId={1}
        needsVerification={true}
        summaryFormData={mockSummaryData}
        taskListElements={[]}
      />,
    );

    const button = screen.getByRole("button", { name: /back/i });

    expect(button).toBeVisible();

    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith(
      `/reports/1/additional-reporting-data`,
    );
  });

  it("should render a continue button that navigates to the verification page", async () => {
    render(
      <ComplianceSummaryForm
        versionId={1}
        needsVerification={true}
        summaryFormData={mockSummaryData}
        taskListElements={[]}
      />,
    );

    const button = screen.getByRole("button", {
      name: /Continue/i,
    });

    expect(button).toBeVisible();

    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith(`/reports/1/verification`);
  });

  it("should render a continue button that navigates to the final review page", async () => {
    render(
      <ComplianceSummaryForm
        versionId={1}
        needsVerification={false}
        summaryFormData={mockSummaryData}
        taskListElements={[]}
      />,
    );

    const button = screen.getByRole("button", {
      name: /Continue/i,
    });

    expect(button).toBeVisible();

    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith(`/reports/1/final-review`);
  });
});
