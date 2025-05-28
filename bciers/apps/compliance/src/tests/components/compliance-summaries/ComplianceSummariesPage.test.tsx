import { render, screen } from "@testing-library/react";
import ComplianceSummariesPage from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesPage";
import * as fetchModule from "@/compliance/src/app/utils/fetchComplianceSummariesPageData";

// Mocking the child component until this issue is fixed: https://github.com/testing-library/react-testing-library/issues/1209#issuecomment-1673372612
vi.mock(
  "apps/compliance/src/app/components/compliance-summaries/ComplianceSummariesDataGrid",
  () => {
    return {
      default: () => <div>mocked child component</div>,
    };
  },
);

// Spy on fetchComplianceSummariesPageData
const fetchSpy = vi.spyOn(fetchModule, "fetchComplianceSummariesPageData");

describe("ComplianceSummariesPage", () => {
  const mockSearchParams = { page: "1", limit: "10" };
  const mockFetchResponse = {
    rows: [],
    row_count: 0,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    fetchSpy.mockResolvedValue(mockFetchResponse);
  });

  it("renders two alerts", async () => {
    render(
      await ComplianceSummariesPage({
        searchParams: mockSearchParams,
      }),
    );
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
  });

  it("renders alerts with correct content", async () => {
    render(
      await ComplianceSummariesPage({
        searchParams: mockSearchParams,
      }),
    );
    const alerts = screen.getAllByRole("alert");
    expect(alerts[0]).toHaveTextContent(
      "Your compliance obligation for the 2024 reporting year is due on November 30, 2025. Please pay five business days in advance to account for the processing time.",
    );
    expect(alerts[0].querySelector(".MuiAlert-icon")).toBeVisible();
    expect(alerts[1]).toHaveTextContent(
      "An automatic overdue penalty has been incurred and accrues at 0.38% daily since the compliance obligation was not paid by its due date. You may pay the penalty after the compliance obligation is paid.",
    );
    expect(alerts[1].querySelector(".MuiAlert-icon")).toBeVisible();
  });

  it("renders the grid component", async () => {
    render(
      await ComplianceSummariesPage({
        searchParams: mockSearchParams,
      }),
    );
    expect(screen.getByText("mocked child component")).toBeVisible();
  });

  it("calls fetchComplianceSummariesPageData", async () => {
    render(
      await ComplianceSummariesPage({
        searchParams: mockSearchParams,
      }),
    );
    expect(fetchSpy).toHaveBeenCalledWith(mockSearchParams);
  });
});
