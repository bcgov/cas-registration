import { render, screen } from "@testing-library/react";
import ComplianceSummariesPage from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesPage";
import * as fetchModule from "@/compliance/src/app/utils/fetchComplianceSummariesPageData";
import * as sessionUtils from "@bciers/utils/src/sessionUtils";
import { DataGridSearchParams } from "@/compliance/src/app/types";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import * as reportingYearModule from "@reporting/src/app/utils/getReportingYear";

// --- Component Mocks ---

vi.mock(
  "apps/compliance/src/app/components/compliance-summaries/ComplianceSummariesDataGrid",
  () => ({
    default: () => <div>mocked child component</div>,
  }),
);

// --- Utility Mocks ---

vi.mock("@bciers/utils/src/sessionUtils", () => ({
  getSessionRole: vi.fn(() => FrontEndRoles.CAS_ADMIN),
}));

// --- Constants ---

const mockSearchParams: DataGridSearchParams = { page: "1" };
const mockFetchResponse = {
  rows: [
    {
      id: 1,
      operation_name: "Test Operation",
      reporting_year: 2024,
      excess_emissions: 0,
    },
  ],
  row_count: 1,
};

// --- Spies ---

const fetchSpy = vi.spyOn(fetchModule, "fetchComplianceSummariesPageData");
const roleSpy = vi.spyOn(sessionUtils, "getSessionRole");

// --- Helpers ---

const renderPage = async () => {
  return render(
    await ComplianceSummariesPage({ searchParams: mockSearchParams }),
  );
};

// --- Tests ---

describe("ComplianceSummariesPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchSpy.mockResolvedValue(mockFetchResponse);
    roleSpy.mockResolvedValue(FrontEndRoles.CAS_ADMIN);
    vi.spyOn(reportingYearModule, "getReportingYear").mockResolvedValue({
      reporting_year: 2024,
      report_due_date: "2025-03-31",
      reporting_window_end: "2025-03-31",
    });
  });

  it("renders the grid component", async () => {
    await renderPage();
    expect(screen.getByText("mocked child component")).toBeVisible();
  });

  it("calls fetchComplianceSummariesPageData with search params", async () => {
    await renderPage();
    expect(fetchSpy).toHaveBeenCalledWith(mockSearchParams);
  });

  it("renders alert message with dynamic reporting year", async () => {
    await renderPage();
    expect(
      screen.getByText(
        /Your compliance obligation for the 2024 reporting year is/i,
      ),
    ).toBeVisible();
    expect(screen.getByText(/due on November 30, 2025/i)).toBeVisible();
  });
});
