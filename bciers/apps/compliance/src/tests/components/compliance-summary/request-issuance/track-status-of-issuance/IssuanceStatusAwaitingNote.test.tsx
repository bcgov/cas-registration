import { IssuanceStatusAwaitingNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusAwaitingNote";
import { bcCarbonRegistryLink } from "@bciers/utils/src/urls";
import { vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

vi.mock("@bciers/components/icons", () => ({
  TimeIcon: (props: any) => (
    <div data-testid="time-icon" {...props}>
      Time Icon
    </div>
  ),
}));

describe("IssuanceStatusAwaitingNote", () => {
  it("displays the correct text content", () => {
    render(<IssuanceStatusAwaitingNote />);

    const awaitingNoteTextPatterns = [
      /your request has been submitted successfully/i,
      /once your request is approved/i,
      /the earned credits will be issued/i,
      /to your holding account/i,
      /as identified below/i,
      /b\.c\. carbon registry/i,
      /\(bccr\)/i,
    ];

    for (const textPattern of awaitingNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
  });

  it("displays the TimeIcon with correct props", () => {
    render(<IssuanceStatusAwaitingNote />);

    const awaitingNoteTimeIcon = screen.getByTestId("time-icon");
    expect(awaitingNoteTimeIcon).toBeVisible();
    expect(awaitingNoteTimeIcon).toHaveAttribute("width", "25");
    expect(awaitingNoteTimeIcon).toHaveAttribute("height", "25");
  });

  it("includes the correct BCCR link", () => {
    render(<IssuanceStatusAwaitingNote />);

    const bccrLink = screen.getByText("B.C. Carbon Registry");
    expect(bccrLink).toBeVisible();
    expect(bccrLink).toHaveAttribute("href", bcCarbonRegistryLink);
  });
});
