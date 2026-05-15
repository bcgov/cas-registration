import { render, screen } from "@testing-library/react";
import { getFacilityFinalReviewData } from "@reporting/src/app/utils/getFacilityFinalReviewData";
import FacilityReportFinalReview, {
  OriginSearchParams,
} from "@reporting/src/app/components/finalReview/FacilityReportFinalReview";

vi.mock("@reporting/src/app/utils/getFacilityFinalReviewData", () => ({
  getFacilityFinalReviewData: vi.fn(),
}));

vi.mock(
  "@reporting/src/app/components/finalReview/FacilityReportFinalReviewContent",
  () => ({
    default: ({ data, backUrl }: any) => (
      <div data-testid="facility-report-content">
        <span data-testid="facility-name">{data.facility_name}</span>
        <a data-testid="back-url" href={backUrl}>
          Back
        </a>
      </div>
    ),
  }),
);

describe("FacilityReportFinalReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches data and passes it to the content component", async () => {
    (getFacilityFinalReviewData as any).mockResolvedValue({
      facility_name: "Test Facility",
    });

    render(
      await FacilityReportFinalReview({ version_id: 123, facility_id: "abc" }),
    );

    expect(getFacilityFinalReviewData).toHaveBeenCalledWith(123, "abc");
    expect(screen.getByTestId("facility-name")).toHaveTextContent(
      "Test Facility",
    );
  });

  it("constructs the correct backUrl from version_id and origin", async () => {
    (getFacilityFinalReviewData as any).mockResolvedValue({
      facility_name: "Test Facility",
    });

    render(
      await FacilityReportFinalReview({
        version_id: 99,
        facility_id: "abc",
        searchParams: { origin: "final-review" } as OriginSearchParams,
      }),
    );

    expect(screen.getByTestId("back-url")).toHaveAttribute(
      "href",
      "/reporting/reports/99/final-review#facility-grid",
    );
  });

  it("throws when data fetching fails", async () => {
    (getFacilityFinalReviewData as any).mockRejectedValue(
      new Error("Failed to fetch"),
    );

    await expect(
      FacilityReportFinalReview({ version_id: 1, facility_id: "abc" }),
    ).rejects.toThrow("Failed to fetch");
  });
});
