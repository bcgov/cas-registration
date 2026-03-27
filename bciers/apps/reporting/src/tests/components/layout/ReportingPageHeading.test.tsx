import { render, screen } from "@testing-library/react";
import ReportingPageHeading from "@reporting/src/app/components/layout/ReportingPageHeading";
import { getReportVersionDetails } from "@reporting/src/app/utils/getReportVersionDetails";

vi.mock("@reporting/src/app/utils/getReportVersionDetails", () => ({
  getReportVersionDetails: vi.fn(),
}));

describe("ReportingPageHeading", () => {
  it("renders the operation name and version number", async () => {
    (getReportVersionDetails as any).mockResolvedValue({
      operation_name: "Test Operation",
      version_number: 1,
    });

    const component = await ReportingPageHeading({ version_id: 1 });
    render(component);

    expect(screen.getByText("Test Operation")).toBeVisible();
    expect(screen.getByText("Version 1")).toBeVisible();
    // calls getReportVersionDetails with the given version_id
    expect(getReportVersionDetails).toHaveBeenCalledWith(1);
  });
});
