import { render, screen } from "@testing-library/react";
import ComplianceSummariesPage from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesPage";
import * as fetchModule from "@/compliance/src/app/utils/fetchComplianceSummariesPageData";
import * as sessionUtils from "@bciers/utils/src/sessionUtils";
import { DataGridSearchParams } from "@/compliance/src/app/types";
import {
  ComplianceSummaryStatus,
  FrontEndRoles,
  PenaltyStatus,
} from "@bciers/utils/src/enums";
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
  getSessionRole: vi.fn(() => FrontEndRoles.INDUSTRY_USER_ADMIN),
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
    {
      id: 2,
      operation_name: "Another Test Operation",
      reporting_year: 2024,
      excess_emissions: 1000,
      obligation_id: "obligation-123",
      status: ComplianceSummaryStatus.OBLIGATION_NOT_MET,
    },
  ],
  row_count: 2,
};
const mockFetchResponseNoUnmetObligations = {
  rows: [
    {
      id: 1,
      operation_name: "Test Operation",
      reporting_year: 2024,
      excess_emissions: 50,
      status: ComplianceSummaryStatus.OBLIGATION_FULLY_MET,
    },
  ],
  row_count: 1,
};
const mockFetchResponseWithPenalty = {
  rows: [
    {
      id: 1,
      operation_name: "Test Operation",
      reporting_year: 2024,
      excess_emissions: 50,
      status: ComplianceSummaryStatus.OBLIGATION_NOT_MET,
      penalty_status: PenaltyStatus.ACCRUING,
      obligation_id: "obligation-111",
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
    roleSpy.mockResolvedValue(FrontEndRoles.INDUSTRY_USER_ADMIN);
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

  // neither alerts
  it("doesn't render either alert messages if no obligations fully met", async () => {
    fetchSpy.mockResolvedValue(mockFetchResponseNoUnmetObligations);
    await renderPage();

    expect(
      screen.queryByText(
        /Your compliance obligation for the 2024 reporting year is/i,
      ),
    ).toBeNull();
    expect(
      screen.queryByText(/An automatic overdue penalty has been incurred/i),
    ).toBeNull();
  });

  // first alert only
  it("renders 1st alert message with dynamic reporting year", async () => {
    const currentDate = new Date(2025, 9, 30);
    vi.setSystemTime(currentDate);
    await renderPage();
    expect(
      screen.getByText(
        /Your compliance obligation for the 2024 reporting year is/i,
      ),
    ).toBeVisible();
    expect(screen.getByText(/due on November 30, 2025/i)).toBeVisible();
    expect(
      screen.queryByText(/An automatic overdue penalty has been incurred/i),
    ).toBeNull();
  });

  // both alerts + first alert modified
  it("renders both alert messages for overdue penalty if date was past due and initial data has obligation not met", async () => {
    fetchSpy.mockResolvedValue(mockFetchResponseWithPenalty);
    const currentDate = new Date(2025, 11, 1);
    vi.setSystemTime(currentDate);

    await renderPage();

    expect(
      screen.getByText(
        /Your compliance obligation for the 2024 reporting year was/i,
      ),
    ).toBeVisible();
    expect(screen.getByText(/due on November 30, 2025/i)).toBeVisible();
    expect(
      screen.getByText(/An automatic overdue penalty has been incurred/i),
    ).toBeVisible();
  });

  // midnight to next day deadline
  it("renders different 1st alert message before and after midnight deadline", async () => {
    const currentDate = new Date(2025, 10, 30, 23, 58, 59);
    vi.setSystemTime(currentDate);
    await renderPage();

    expect(
      screen.getByText(
        /Your compliance obligation for the 2024 reporting year is/i,
      ),
    ).toBeVisible();

    // next day
    const newDate = new Date(2025, 11, 1, 0, 0, 1);
    vi.setSystemTime(newDate);
    await renderPage();

    expect(
      screen.getByText(
        /Your compliance obligation for the 2024 reporting year was/i,
      ),
    ).toBeVisible();
  });
});
