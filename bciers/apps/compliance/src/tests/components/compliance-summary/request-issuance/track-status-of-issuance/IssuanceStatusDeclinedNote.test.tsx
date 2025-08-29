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
      /in the b\.c\. carbon registry/i,
      /\(bccr\)/i,
      /please contact us at/i,
      /ghgregulator@gov\.bc\.ca/i,
      /for further information or assistance/i,
      /submitting a supplementary report/i,
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

  it("includes the correct email link", () => {
    render(<IssuanceStatusDeclinedNote />);

    const emailLink = screen.getByText("GHGRegulator@gov.bc.ca");
    expect(emailLink).toBeVisible();
    expect(emailLink).toHaveAttribute("href", ghgRegulatorEmail);
  });
});
