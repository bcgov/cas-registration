import { IssuanceStatusDeclinedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusDeclinedNote";
import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  bcCarbonRegistryLink,
  bceabLink,
  ghgRegulatorEmail,
} from "@bciers/utils/src/urls";
import { AnalystSuggestion } from "@bciers/utils/src/enums";

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

  it("shows GHGRegulator email and supplementary instructions when analyst suggests supplementary report", () => {
    render(
      <IssuanceStatusDeclinedNote
        formContext={{
          analystSuggestion: AnalystSuggestion.REQUIRING_SUPPLEMENTARY_REPORT,
        }}
      />,
    );

    // Common preamble should be visible and B.C. Carbon Registry should NOT be a link
    expect(screen.getByText(/your request is declined/i)).toBeVisible();
    expect(screen.getByText(/B\.C\. Carbon Registry/i)).toBeVisible();
    expect(
      screen.queryByRole("link", { name: /B\.C\. Carbon Registry/i }),
    ).toBeNull();

    // Email link should be present with correct href
    const emailAnchor = screen.getByRole("link", {
      name: /GHGRegulator@gov\.bc\.ca/i,
    });
    expect(emailAnchor).toBeVisible();
    expect(emailAnchor).toHaveAttribute("href", ghgRegulatorEmail);

    // Supplementary instructions text
    expect(
      screen.getByText(
        /for further information or assistance in submitting a supplementary report\./i,
      ),
    ).toBeVisible();
  });

  it("displays the correct text content", () => {
    render(
      <IssuanceStatusDeclinedNote
        formContext={{
          latestComplianceReportVersionId: 2,
          supplementaryDeclined: true,
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
