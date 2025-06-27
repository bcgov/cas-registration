import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import InternalTrackStatusOfIssuanceComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalTrackStatusOfIssuanceComponent";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { RequestIssuanceTrackStatusData } from "@/compliance/src/app/types";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("InternalTrackStatusOfIssuanceComponent", () => {
  const mockComplianceSummaryId = "123";
  const mockData: RequestIssuanceTrackStatusData = {
    earned_credits: 100,
    issuance_status: IssuanceStatus.APPROVED,
    bccr_trading_name: "Test Trading Name",
    holding_account_id: "123456789",
    directors_comments: "Test comments",
    analysts_comments: "Analyst's comments",
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields and navigation buttons", () => {
    render(
      <InternalTrackStatusOfIssuanceComponent
        data={mockData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    // Check form title
    expect(screen.getByText("Track Status of Issuance")).toBeVisible();

    // Check section headers
    expect(screen.getByText("Earned Credits")).toBeVisible();

    // Check field labels
    expect(screen.getByText("Earned Credits:")).toBeVisible();
    expect(screen.getByText("Status of Issuance:")).toBeVisible();
    expect(screen.getByText("BCCR Trading Name:")).toBeVisible();
    expect(screen.getByText("BCCR Holding Account ID:")).toBeVisible();
    expect(screen.getByText("Director's Comments:")).toBeVisible();

    // Check navigation buttons
    expect(screen.getByRole("button", { name: "Back" })).toBeVisible();
  });

  it("hanldes navigation button with correct props", () => {
    render(
      <InternalTrackStatusOfIssuanceComponent
        data={mockData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    //Check the button states
    const backButton = screen.getByRole("button", { name: "Back" });
    expect(backButton).toBeVisible();

    //Test back button navigation
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceSummaryId}/review-by-director`,
    );
  });
});
