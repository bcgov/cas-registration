import { render } from "@testing-library/react";
import ComplianceSummaryForm from "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm";
import ComplianceSummaryPage from "@reporting/src/app/components/complianceSummary/ComplianceSummaryPage";
import { actionHandler } from "@bciers/actions";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";

import { vi } from "vitest";
import { getComplianceSummaryTaskList } from "@reporting/src/app/components/taskList/4_complianceSummary";

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

vi.mock("@reporting/src/app/utils/getReportNeedsVerification", () => ({
  getReportNeedsVerification: vi.fn(),
}));

const mockComplianceSummaryForm = ComplianceSummaryForm as ReturnType<
  typeof vi.fn
>;
const mockActionHandler = actionHandler as ReturnType<typeof vi.fn>;

const mockGetReportNeedsVerification = getReportNeedsVerification as ReturnType<
  typeof vi.fn
>;

describe("ComplianceSummaryPage", () => {
  it("renders ComplianceSummaryForm with needsVerification = false for non-regulated purpose below emissions threshold", async () => {
    const versionId = 12345;

    // Mock the data for the test
    const complianceData = { some: "data" };
    mockActionHandler.mockResolvedValue(complianceData);
    mockGetReportNeedsVerification.mockResolvedValue(false);

    // Render the page
    render(await ComplianceSummaryPage({ version_id: versionId }));

    // Validate that ComplianceSummaryForm was called with the expected props
    expect(mockComplianceSummaryForm).toHaveBeenCalledWith(
      {
        versionId,
        summaryFormData: complianceData,
        taskListElements: getComplianceSummaryTaskList(),
      },
      {},
    );
  });

  it("renders ComplianceSummaryForm with needsVerification = true for regulated purpose", async () => {
    const versionId = 12345;

    // Mock the data for the test
    const complianceData = { some: "data" };
    mockActionHandler.mockResolvedValue(complianceData);
    mockGetReportNeedsVerification.mockResolvedValue(true);

    // Render the page
    render(await ComplianceSummaryPage({ version_id: versionId }));

    // Validate that ComplianceSummaryForm was called with the expected props
    expect(mockComplianceSummaryForm).toHaveBeenCalledWith(
      {
        versionId,
        summaryFormData: complianceData,
        taskListElements: getComplianceSummaryTaskList(),
      },
      {},
    );
  });

  it("renders ComplianceSummaryForm with needsVerification = true for high emissions", async () => {
    const versionId = 12345;

    // Mock the data for the test
    const complianceData = { some: "data" };
    mockActionHandler.mockResolvedValue(complianceData);
    mockGetReportNeedsVerification.mockResolvedValue(true);

    // Render the page
    render(await ComplianceSummaryPage({ version_id: versionId }));

    // Validate that ComplianceSummaryForm was called with the expected props
    expect(mockComplianceSummaryForm).toHaveBeenCalledWith(
      {
        versionId,
        summaryFormData: complianceData,
        taskListElements: getComplianceSummaryTaskList(),
      },
      {},
    );
  });
});
