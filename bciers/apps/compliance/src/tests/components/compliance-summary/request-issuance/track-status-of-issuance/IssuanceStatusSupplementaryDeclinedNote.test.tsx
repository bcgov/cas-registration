import { vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { IssuanceStatusSupplementaryDeclinedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusSupplementaryDeclinedNote";

vi.mock("@bciers/components/icons/AlertIcon", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="alert-icon" {...props}>
      Alert Icon
    </div>
  ),
}));

describe("IssuanceStatusSupplementaryDeclinedNote", () => {
  it("displays the correct text content", () => {
    render(
      <IssuanceStatusSupplementaryDeclinedNote
        formContext={{
          latestComplianceReportVersionId: 2,
        }}
      />,
    );

    const declinedNoteTextPatterns = [
      /This issuance request is declined because you submitted a supplementary/i,
      /report. Please/i,
    ];
    const link = `/compliance/compliance-administration/compliance-summaries/2/review-compliance-earned-credits-report`;

    for (const textPattern of declinedNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
    // Verify BCCR link and href
    const bccrAnchor = screen.getByRole("link", {
      name: /submit a new issuance of earned credits request./i,
    });
    expect(bccrAnchor).toBeVisible();
    expect(bccrAnchor).toHaveAttribute("href", link);
  });
});
