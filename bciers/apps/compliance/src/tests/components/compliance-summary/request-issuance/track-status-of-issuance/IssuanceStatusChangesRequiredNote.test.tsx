import { IssuanceStatusChangesRequiredNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusChangesRequiredNote";
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

describe("IssuanceStatusChangesRequiredNote", () => {
  it("displays the correct text content", () => {
    render(<IssuanceStatusChangesRequiredNote />);

    const changesRequiredTextPatterns = [
      /your request has not been approved yet. please/i,
      /submit a supplementary report/i,
      /in reporting to make the changes required below/i,
      /or contact us at/i,
      /ghgregulator@gov\.bc\.ca/i,
      /if you have questions/i,
    ];

    for (const textPattern of changesRequiredTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
  });

  it("displays the AlertIcon with correct props", () => {
    render(<IssuanceStatusChangesRequiredNote />);

    const alertIcon = screen.getByTestId("alert-icon");
    expect(alertIcon).toBeVisible();
    expect(alertIcon).toHaveAttribute("width", "20");
    expect(alertIcon).toHaveAttribute("height", "20");
  });

  it("includes the supplementary report link with correct styles", () => {
    render(<IssuanceStatusChangesRequiredNote />);

    const reportLink = screen.getByText("submit a supplementary report");
    expect(reportLink).toBeVisible();
    expect(reportLink).toHaveAttribute("href", "/reporting/reports");
  });

  it("includes the GHG Regulator email link with correct styles and href", () => {
    render(<IssuanceStatusChangesRequiredNote />);

    const emailLink = screen.getByText("GHGRegulator@gov.bc.ca");
    expect(emailLink).toBeVisible();
    expect(emailLink).toHaveAttribute("href", ghgRegulatorEmail);
  });
});
