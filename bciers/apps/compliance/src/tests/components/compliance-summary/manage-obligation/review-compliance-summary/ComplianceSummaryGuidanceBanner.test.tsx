import { render, screen } from "@testing-library/react";
import { ComplianceSummaryGuidanceBanner } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryGuidanceBanner";

describe("ComplianceSummaryGuidanceBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders guidance document link with correct attributes", () => {
    render(<ComplianceSummaryGuidanceBanner />);

    const bccrLink = screen.getByRole("link", {
      name: "compliance guidance document.",
    });
    expect(bccrLink).toBeVisible();
    expect(bccrLink).toHaveAttribute(
      "href",
      "https://www2.gov.bc.ca/assets/gov/environment/climate-change/ind/obps/guidance/bc_obps_compliance_guidance.pdf",
    );
    expect(bccrLink).toHaveAttribute("target", "_blank");
    expect(bccrLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
