import { IssuanceStatusChangesRequiredNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusChangesRequiredNote";
import { render, screen } from "@testing-library/react";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";

vi.mock("@bciers/components/icons", () => ({
  AlertIcon: (props: any) => (
    <div data-testid="alert-icon" {...props}>
      Alert Icon
    </div>
  ),
}));

vi.mock("@bciers/components/form/components/AlertNote", () => ({
  default: ({
    children,
    icon,
  }: {
    children: React.ReactNode;
    icon: React.ReactNode;
  }) => (
    <div data-testid="alert-note">
      {icon}
      {children}
    </div>
  ),
}));

describe("IssuanceStatusChangesRequiredNote", () => {
  it("displays the correct text content", () => {
    render(<IssuanceStatusChangesRequiredNote />);

    const expectedTextPatterns = [
      /your request is not approved yet\. please/i,
      /make the changes required below/i,
      /before submitting a new request/i,
      /or contact us at/i,
      /ghgregulator@gov\.bc\.ca/i,
      /if you have questions/i,
    ];

    for (const textPattern of expectedTextPatterns) {
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

  it("renders the AlertNote component", () => {
    render(<IssuanceStatusChangesRequiredNote />);

    const alertNote = screen.getByTestId("alert-note");
    expect(alertNote).toBeVisible();
  });

  it("includes the GHG Regulator email link with correct styles and href", () => {
    render(<IssuanceStatusChangesRequiredNote />);

    const emailLink = screen.getByText("GHGRegulator@gov.bc.ca");
    expect(emailLink).toBeVisible();
    expect(emailLink).toHaveAttribute("href", ghgRegulatorEmail);
    expect(emailLink).toHaveClass(
      "text-bc-link-blue",
      "decoration-bc-link-blue",
    );
  });
});
