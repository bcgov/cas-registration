import { render, screen } from "@testing-library/react";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";
import { ChangesRequiredAlertNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/ChangesRequiredAlertNote";

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

describe("ChangesRequiredAlertNote", () => {
  it("displays the correct text content", () => {
    render(<ChangesRequiredAlertNote />);

    const alertNote = screen.getByTestId("alert-note");

    expect(alertNote).toHaveTextContent(
      "Changes required. Please change your BCCR Holding Account ID. If you have questions, contact GHGRegulator@gov.bc.ca.",
    );
  });

  it("includes the GHG Regulator email link with correct styles and href", () => {
    render(<ChangesRequiredAlertNote />);

    const emailLink = screen.getByText("GHGRegulator@gov.bc.ca");
    expect(emailLink).toBeVisible();
    expect(emailLink).toHaveAttribute("href", ghgRegulatorEmail);
    expect(emailLink).toHaveClass(
      "text-bc-link-blue",
      "decoration-bc-link-blue",
    );
  });
});
