import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { getFacilityFinalReviewData } from "@reporting/src/app/utils/getFacilityFinalReviewData";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import FacilityReportFinalReview from "@reporting/src/app/components/finalReview/FacilityReportFinalReview";

vi.mock("@reporting/src/app/utils/getFacilityFinalReviewData", () => ({
  getFacilityFinalReviewData: vi.fn(),
}));

const mockRouterPush = vi.fn();
vi.mock("next/navigation", async () => {
  const actual: any = await vi.importActual("next/navigation");
  return {
    ...actual,
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
    usePathname: vi.fn(),
  };
});

vi.mock(
  "@bciers/components/navigation/reportingTaskList/ReportingTaskList",
  () => ({
    default: ({ elements }: any) => (
      <div data-testid="reporting-task-list">
        {elements.map((el: any) => el.text).join(", ")}
      </div>
    ),
  }),
);

vi.mock("@reporting/src/app/components/shared/FacilityReportSection", () => ({
  __esModule: true,
  default: ({ facilityData }: any) => (
    <div data-testid="facility-report-section">
      Facility Section: {facilityData.facility_name || "No Name"}
    </div>
  ),
}));

vi.mock("@bciers/components/loading/SkeletonGrid", () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading...</div>,
}));

describe("FacilityReportFinalReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockRouterPush });
    (usePathname as any).mockReturnValue("/reporting/reports/123/final-review");
  });

  it("renders loading when data is being fetched", async () => {
    (useSearchParams as any).mockReturnValue({
      get: () => "facility-1",
    });
    (getFacilityFinalReviewData as any).mockImplementation(
      () => new Promise(() => {}), // never resolves
    );

    render(<FacilityReportFinalReview version_id={1} />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(getFacilityFinalReviewData).toHaveBeenCalledWith(1, "facility-1");
  });

  it("renders facility section and task list when data is loaded", async () => {
    (useSearchParams as any).mockReturnValue({
      get: () => "facility-1",
    });
    (getFacilityFinalReviewData as any).mockResolvedValue({
      facility_name: "Test Facility",
    });

    render(<FacilityReportFinalReview version_id={123} />);

    await waitFor(() => {
      expect(screen.getByTestId("facility-report-section")).toHaveTextContent(
        "Test Facility",
      );
      expect(screen.getByTestId("reporting-task-list")).toHaveTextContent(
        "Back to previous page",
      );
    });
  });

  it("shows loading and does not fetch when facility_id is missing", async () => {
    (useSearchParams as any).mockReturnValue({
      get: () => null,
    });

    render(<FacilityReportFinalReview version_id={42} />);

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toBeInTheDocument();
    });
    expect(getFacilityFinalReviewData).not.toHaveBeenCalled();
  });

  it("navigates back when Back button is clicked", async () => {
    (useSearchParams as any).mockReturnValue({
      get: () => "facility-1",
    });
    (getFacilityFinalReviewData as any).mockResolvedValue({
      facility_name: "Test Facility",
    });

    render(<FacilityReportFinalReview version_id={99} />);

    const backButton = await screen.findByRole("button", { name: /back/i });
    backButton.click();

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/reporting/reports/99/final-review#facility-grid",
    );
  });
});
