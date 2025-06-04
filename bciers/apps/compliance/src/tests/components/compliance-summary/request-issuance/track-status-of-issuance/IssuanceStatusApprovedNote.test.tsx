import { IssuanceStatusApprovedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusApprovedNote";
import { vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { bcCarbonRegistryLink } from "@bciers/utils/src/urls";

vi.mock("@bciers/components/icons/Check", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="check-icon" {...props}>
      Check Icon
    </div>
  ),
}));

describe("IssuanceStatusApprovedNote", () => {
  it("displays the correct text content", () => {
    render(<IssuanceStatusApprovedNote />);

    const approvedNoteTextPatterns = [
      /your request is approved/i,
      /the earned credits have been issued/i,
      /to your holding account/i,
      /as identified below/i,
      /b\.c\. carbon registry/i,
      /\(bccr\)/i,
      /successfully/i,
    ];

    for (const textPattern of approvedNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
  });

  it("displays the Check icon with correct props", () => {
    render(<IssuanceStatusApprovedNote />);

    const approvedNoteCheckIcon = screen.getByTestId("check-icon");
    expect(approvedNoteCheckIcon).toBeVisible();
    expect(approvedNoteCheckIcon).toHaveAttribute("width", "20");
  });

  it("includes the correct BCCR link", () => {
    render(<IssuanceStatusApprovedNote />);

    const bccrLink = screen.getByText("B.C. Carbon Registry");
    expect(bccrLink).toBeVisible();
    expect(bccrLink).toHaveAttribute("href", bcCarbonRegistryLink);
  });
});
