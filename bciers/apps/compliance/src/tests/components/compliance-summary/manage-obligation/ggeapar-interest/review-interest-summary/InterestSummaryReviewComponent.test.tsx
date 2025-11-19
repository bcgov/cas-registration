import { render, screen, fireEvent } from "@testing-library/react";
import InterestSummaryReviewComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/ggeapar-interest/review-interest-summary/InterestSummaryReviewComponent";

// Mock Next.js router used by ComplianceStepButtons
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const mockData = {
  has_penalty: true,
  penalty_status: "Not Paid",
  penalty_type: "Late Submission",
  penalty_amount: "100.00",
  faa_interest: "10.00",
  total_amount: "110.00",
  data_is_fresh: true,
};

describe("InterestSummaryReviewComponent", () => {
  it("renders the form with correct data", () => {
    render(
      <InterestSummaryReviewComponent
        data={mockData}
        complianceReportVersionId={123}
      />,
    );

    // Core headings
    expect(screen.getByText("Review Interest Summary")).toBeVisible();
    expect(screen.getByText("GGEAPAR Interest")).toBeVisible();
    expect(
      screen.getByText(
        /Financial Administration Act \(FAA\) interest is incurred and accrues at/i,
      ),
    ).toBeVisible();

    // Minimal key-value checks following repo style: label and value asserted separately
    expect(screen.getByText("Status:")).toBeVisible();
    expect(screen.getByText("Not Paid")).toBeVisible();

    expect(screen.getByText("GGEAPAR Interest Rate (Annual):")).toBeVisible();
    expect(screen.getByText("Prime + 3.00%"));

    expect(screen.getByText("GGEAPAR Interest Amount:")).toBeVisible();
    expect(screen.getByText("100.00")).toBeVisible();

    expect(screen.getByText("FAA Interest (Annual):")).toBeVisible();
    expect(screen.getByText("10.00")).toBeVisible();

    expect(screen.getByText("Total Amount:")).toBeVisible();
    expect(screen.getByText("110.00")).toBeVisible();
  });

  it("renders back button and navigates to the correct URL", () => {
    render(
      <InterestSummaryReviewComponent
        data={mockData}
        complianceReportVersionId={123}
      />,
    );

    const backButton = screen.getByRole("button", { name: /back/i });
    expect(backButton).toBeVisible();
    fireEvent.click(backButton);
    expect(pushMock).toHaveBeenCalledWith(
      "/compliance-administration/compliance-summaries/123/pay-obligation-track-payments",
    );
  });
});
