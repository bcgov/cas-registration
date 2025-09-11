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
      /\(bccr\)/i,
      /you may appeal the decision/i,
      /\(bceab\)/i,
    ];

    for (const textPattern of declinedNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
    // Verify links and their hrefs
    const bccrAnchor = screen.getByRole("link", {
      name: /b\.c\. carbon registry/i,
    });
    expect(bccrAnchor).toBeVisible();
    expect(bccrAnchor).toHaveAttribute("href", bcCarbonRegistryLink);

    const bceabAnchor = screen.getByRole("link", {
      name: /b\.c\. environmental appeal board/i,
    });
    expect(bceabAnchor).toBeVisible();
    expect(bceabAnchor).toHaveAttribute("href", bceabLink);
  });

  it("displays the AlertIcon with correct props", () => {
    render(<IssuanceStatusDeclinedNote />);

    const alertIcon = screen.getByTestId("alert-icon");
    expect(alertIcon).toBeVisible();
    expect(alertIcon).toHaveAttribute("width", "20");
    expect(alertIcon).toHaveAttribute("height", "20");
  });
});
