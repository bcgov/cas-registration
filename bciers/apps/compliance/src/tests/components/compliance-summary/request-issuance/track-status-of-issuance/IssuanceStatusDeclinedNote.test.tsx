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
      /you may appeal the decision/i,
      /\(bceab\)/i,
    ];

    for (const textPattern of declinedNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
    // Verify BCCR link and href
    const bccrAnchor = screen.getByRole("link", {
      name: /B\.C\. Carbon Registry/i,
    });
    expect(bccrAnchor).toBeVisible();
    expect(bccrAnchor).toHaveAttribute("href", bcCarbonRegistryLink);

    // Verify BCEAB link and href
    const bceabAnchor = screen.getByRole("link", {
      name: /B\.C\. Environmental Appeal Board/i,
    });
    expect(bceabAnchor).toBeVisible();
    expect(bceabAnchor).toHaveAttribute("href", bceabLink);
  });
});
