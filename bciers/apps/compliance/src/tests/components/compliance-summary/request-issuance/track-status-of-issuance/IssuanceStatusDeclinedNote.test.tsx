import { IssuanceStatusDeclinedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusDeclinedNote";
import { vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { bcCarbonRegistryLink, bceabLink } from "@bciers/utils/src/urls";

vi.mock("@bciers/components/icons/AlertIcon", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="alert-icon" {...props}>
      Alert Icon
    </div>
  ),
}));

describe("IssuanceStatusDeclinedNote", () => {
  it("displays the correct text content", () => {
    render(<IssuanceStatusDeclinedNote />);

    const declinedNoteTextPatterns = [
      /your request is declined/i,
      /the earned credits will not be issued/i,
      /to your holding account/i,
      /as identified below/i,
      /b\.c\. carbon registry/i,
      /\(bccr\)/i,
      /you may appeal the decision/i,
      /b\.c\. environmental appeal board/i,
      /\(bceab\)/i,
    ];

    for (const textPattern of declinedNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
  });

  it("displays the AlertIcon with correct props", () => {
    render(<IssuanceStatusDeclinedNote />);

    const alertIcon = screen.getByTestId("alert-icon");
    expect(alertIcon).toBeVisible();
    expect(alertIcon).toHaveAttribute("width", "20");
    expect(alertIcon).toHaveAttribute("height", "20");
  });

  it("includes the correct BCCR link", () => {
    render(<IssuanceStatusDeclinedNote />);

    const bccrLink = screen.getByText("B.C. Carbon Registry");
    expect(bccrLink).toBeVisible();
    expect(bccrLink).toHaveAttribute("href", bcCarbonRegistryLink);
  });

  it("includes the correct BCEAB link", () => {
    render(<IssuanceStatusDeclinedNote />);

    const bceabLinkElement = screen.getByText(
      "B.C. Environmental Appeal Board",
    );
    expect(bceabLinkElement).toBeVisible();
    expect(bceabLinkElement).toHaveAttribute("href", bceabLink);
  });
});
