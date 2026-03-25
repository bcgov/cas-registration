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

    const complianceData = {
      payload: {
        emissions_attributable_for_reporting: 1,
        reporting_only_emissions: 2,
        emissions_attributable_for_compliance: 3,
        emissions_limit: 4,
        excess_emissions: 5,
        credited_emissions: 6,
        regulatory_values: {
          initial_compliance_period: 2024,
          compliance_period: 2025,
        },
        products: [],
        is_operation_opted_out: false,
      },
      report_data: {
        report_version_id: versionId,
        reporting_year: 2025,
      },
      facility_data: undefined,
    };

    mockActionHandler.mockResolvedValue(complianceData);
    mockGetNavigationInformation.mockResolvedValue({ nav: true });

    // Render the page
    render(await ComplianceSummaryPage({ version_id: versionId }));

    // Validate that ComplianceSummaryForm was called with the expected props
    expect(mockComplianceSummaryForm).toHaveBeenCalledWith(
      {
        summaryFormData: {
          ...complianceData.payload,
          reporting_year: 2025,
        },
        navigationInformation: { nav: true },
      },
      undefined,
    );
    expect(mockGetNavigationInformation).toHaveBeenCalledWith(
      HeaderStep.ComplianceSummary,
      ReportingPage.ComplianceSummary,
      12345,
      "",
    );
  });
});
