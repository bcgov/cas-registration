import { render, screen } from "@testing-library/react";
import ComplianceSummaryForm from "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm";
import ComplianceSummaryPage from "@reporting/src/app/components/complianceSummary/ComplianceSummaryPage";
import { getComplianceData } from "@reporting/src/app/utils/complianceSummaryForm/getComplianceData";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";

// ✨ Mocks
vi.mock(
  "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm",
  () => ({
    default: vi.fn(() => <div data-testid="compliance-summary-form" />),
  }),
);

vi.mock(
  "@reporting/src/app/utils/complianceSummaryForm/getComplianceData",
  () => ({
    getComplianceData: vi.fn(),
  }),
);

vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));

const mockComplianceSummaryForm = ComplianceSummaryForm as ReturnType<
  typeof vi.fn
>;

const mockGetComplianceData = getComplianceData as ReturnType<typeof vi.fn>;

const mockGetNavigationInformation = getNavigationInformation as ReturnType<
  typeof vi.fn
>;

describe("ComplianceSummaryPage", () => {
  it("renders ComplianceSummaryForm with the proper tasklist and summaryFormData", async () => {
    const versionId = 12345;

    const response = {
      payload: {
        some: "data",
      },
      report_data: {
        reporting_year: 2025,
      },
    };

    mockGetComplianceData.mockResolvedValue(response);
    mockGetNavigationInformation.mockResolvedValue({ nav: true });

    render(await ComplianceSummaryPage({ version_id: versionId }));

    expect(screen.getByTestId("compliance-summary-form")).toBeInTheDocument();

    expect(mockGetComplianceData).toHaveBeenCalledWith(versionId);

    expect(mockGetNavigationInformation).toHaveBeenCalledWith(
      HeaderStep.ComplianceSummary,
      ReportingPage.ComplianceSummary,
      versionId,
      "",
    );

    expect(mockComplianceSummaryForm).toHaveBeenCalledWith(
      {
        summaryFormData: {
          some: "data",
          reporting_year: 2025,
        },
        navigationInformation: { nav: true },
      },
      undefined,
    );
  });

  it("passes an empty facility id to navigation when facility_data is missing", async () => {
    const versionId = 12345;

    const response = {
      payload: {
        some: "data",
      },
      report_data: {
        reporting_year: 2025,
      },
      facility_data: undefined,
    };

    mockGetComplianceData.mockResolvedValue(response);
    mockGetNavigationInformation.mockResolvedValue({ nav: true });

    render(await ComplianceSummaryPage({ version_id: versionId }));

    expect(screen.getByTestId("compliance-summary-form")).toBeInTheDocument();

    expect(mockGetNavigationInformation).toHaveBeenCalledWith(
      HeaderStep.ComplianceSummary,
      ReportingPage.ComplianceSummary,
      versionId,
      "",
    );

    expect(mockComplianceSummaryForm).toHaveBeenCalledWith(
      {
        summaryFormData: {
          some: "data",
          reporting_year: 2025,
        },
        navigationInformation: { nav: true },
      },
      undefined,
    );
  });
});
