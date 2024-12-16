import { render } from "@testing-library/react";
import ComplianceSummaryForm from "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm";
import ComplianceSummaryPage from "@reporting/src/app/components/complianceSummary/ComplianceSummaryPage";
import { actionHandler } from "@bciers/actions";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { getAttributableEmissions } from "@reporting/src/app/utils/getAttributableEmissions";
import { tasklistData } from "@reporting/src/app/components/complianceSummary/TaskListElements";
import { RegistrationPurposes } from "@/registration/app/components/operations/registration/enums";

import { vi } from "vitest";

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

vi.mock("@reporting/src/app/utils/getRegistrationPurpose", () => ({
  getRegistrationPurpose: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getAttributableEmissions", () => ({
  getAttributableEmissions: vi.fn(),
}));

const mockComplianceSummaryForm = ComplianceSummaryForm as ReturnType<
  typeof vi.fn
>;
const mockActionHandler = actionHandler as ReturnType<typeof vi.fn>;
const mockGetRegistrationPurpose = getRegistrationPurpose as ReturnType<
  typeof vi.fn
>;
const mockGetAttributableEmissions = getAttributableEmissions as ReturnType<
  typeof vi.fn
>;

describe("ComplianceSummaryPage", () => {
  it("renders ComplianceSummaryForm with needsVerification = false for non-regulated purpose below emissions threshold", async () => {
    const versionId = 12345;

    // Mock the data for the test
    const complianceData = { some: "data" };
    const registrationPurpose = RegistrationPurposes.REPORTING_OPERATION;
    const attributableEmissions = 10000000; // Below the threshold

    mockActionHandler.mockResolvedValue(complianceData);
    mockGetRegistrationPurpose.mockResolvedValue({
      registration_purpose: registrationPurpose,
    });
    mockGetAttributableEmissions.mockResolvedValue(attributableEmissions);

    // Render the page
    render(await ComplianceSummaryPage({ version_id: versionId }));

    // Validate that ComplianceSummaryForm was called with the expected props
    expect(mockComplianceSummaryForm).toHaveBeenCalledWith(
      {
        versionId,
        needsVerification: false,
        summaryFormData: complianceData,
        taskListElements: tasklistData,
      },
      {},
    );
  });

  it("renders ComplianceSummaryForm with needsVerification = true for regulated purpose", async () => {
    const versionId = 12345;

    // Mock the data for the test
    const complianceData = { some: "data" };
    const registrationPurpose = RegistrationPurposes.OBPS_REGULATED_OPERATION;

    mockActionHandler.mockResolvedValue(complianceData);
    mockGetRegistrationPurpose.mockResolvedValue({
      registration_purpose: registrationPurpose,
    });

    // Render the page
    render(await ComplianceSummaryPage({ version_id: versionId }));

    // Validate that ComplianceSummaryForm was called with the expected props
    expect(mockComplianceSummaryForm).toHaveBeenCalledWith(
      {
        versionId,
        needsVerification: true,
        summaryFormData: complianceData,
        taskListElements: tasklistData,
      },
      {},
    );
  });

  it("renders ComplianceSummaryForm with needsVerification = true for high emissions", async () => {
    const versionId = 12345;

    // Mock the data for the test
    const complianceData = { some: "data" };
    const registrationPurpose =
      RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION;
    const attributableEmissions = 30000000; // Above the threshold

    mockActionHandler.mockResolvedValue(complianceData);
    mockGetRegistrationPurpose.mockResolvedValue({
      registration_purpose: registrationPurpose,
    });
    mockGetAttributableEmissions.mockResolvedValue(attributableEmissions);

    // Render the page
    render(await ComplianceSummaryPage({ version_id: versionId }));

    // Validate that ComplianceSummaryForm was called with the expected props
    expect(mockComplianceSummaryForm).toHaveBeenCalledWith(
      {
        versionId,
        needsVerification: true,
        summaryFormData: complianceData,
        taskListElements: tasklistData,
      },
      {},
    );
  });
});
