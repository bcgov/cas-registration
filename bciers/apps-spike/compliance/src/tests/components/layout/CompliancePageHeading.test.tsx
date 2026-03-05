import { render, screen } from "@testing-library/react";
import { CompliancePageHeading } from "@/compliance/src/app/components/layout/CompliancePageHeading";

// Mock the getComplianceSummary function
vi.mock("@/compliance/src/app/utils/getComplianceSummary", () => ({
  getComplianceSummary: vi
    .fn()
    .mockResolvedValue({ operation_name: "Operation ABC" }),
}));

const mockComplianceReportVersionId = 123;

describe("CompliancePageHeading", () => {
  it("renders operation name in heading", async () => {
    render(
      await CompliancePageHeading({
        compliance_report_version_id: mockComplianceReportVersionId,
      }),
    );

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeVisible();
    expect(heading).toHaveTextContent("Operation ABC");
    expect(heading).toHaveClass("text-2xl", "font-bold", "text-bc-bg-blue");
  });

  it("renders with correct container styles", async () => {
    render(
      await CompliancePageHeading({
        compliance_report_version_id: mockComplianceReportVersionId,
      }),
    );

    const container = screen.getByText("Operation ABC").closest("div");
    expect(container).toHaveClass("container", "mx-auto", "pb-4");
  });
});
