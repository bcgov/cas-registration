import { IssuanceStatusDeclinedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusDeclinedNote";
import { vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";

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
      /please contact us at/i,
      /for further information or assistance in submitting a supplementary report/i,
    ];

    for (const textPattern of declinedNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
    // Verify GHG Regulator email link and href
    const emailAnchor = screen.getByRole("link", {
      name: /ghgregulator@gov\.bc\.ca/i,
    });
    expect(emailAnchor).toBeVisible();
    expect(emailAnchor).toHaveAttribute("href", ghgRegulatorEmail);
  });

  it("displays the AlertIcon with correct props", () => {
    render(<IssuanceStatusDeclinedNote />);

    const alertIcon = screen.getByTestId("alert-icon");
    expect(alertIcon).toBeVisible();
    expect(alertIcon).toHaveAttribute("width", "20");
    expect(alertIcon).toHaveAttribute("height", "20");
  });
});
