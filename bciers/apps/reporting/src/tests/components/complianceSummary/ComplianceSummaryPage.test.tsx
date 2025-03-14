import { render } from "@testing-library/react";
import ComplianceSummaryForm from "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm";
import ComplianceSummaryPage from "@reporting/src/app/components/complianceSummary/ComplianceSummaryPage";
import { actionHandler } from "@bciers/actions";
import { vi } from "vitest";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";

// ✨ Mocks
vi.mock(
  "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm",
  () => ({
    default: vi.fn(),
  }),
);

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));

const mockComplianceSummaryForm = ComplianceSummaryForm as ReturnType<
  typeof vi.fn
>;
const mockActionHandler = actionHandler as ReturnType<typeof vi.fn>;

const mockGetNavigationInformation = getNavigationInformation as ReturnType<
  typeof vi.fn
>;

describe("ComplianceSummaryPage", () => {
  it("renders ComplianceSummaryForm with the proper tasklist", async () => {
    const versionId = 12345;

    // Mock the data for the test
    const complianceData = { some: "data" };
    mockActionHandler.mockResolvedValue(complianceData);
    mockGetNavigationInformation.mockResolvedValue({ nav: true });

    // Render the page
    render(await ComplianceSummaryPage({ version_id: versionId }));

    // Validate that ComplianceSummaryForm was called with the expected props
    expect(mockComplianceSummaryForm).toHaveBeenCalledWith(
      {
        summaryFormData: complianceData,
        navigationInformation: { nav: true },
      },
      {},
    );
    expect(mockGetNavigationInformation).toHaveBeenCalledWith(
      HeaderStep.ComplianceSummary,
      ReportingPage.ComplianceSummary,
      12345,
      undefined,
    );
  });
});
