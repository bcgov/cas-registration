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
