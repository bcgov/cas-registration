import { render, screen, fireEvent } from "@testing-library/react";
import ComplianceUnitsApplyComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/apply-compliance-units/ApplyComplianceUnitsComponent";
import { useRouter } from "@bciers/testConfig/mocks";

const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

// Mock the actionHandler
vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn().mockResolvedValue({
    tradingName: "Test Trading Co",
    error: null,
  }),
}));

describe("ComplianceUnitsApplyComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with correct schema fields and headers", () => {
    render(<ComplianceUnitsApplyComponent complianceSummaryId="123" />);

    // Check form title
    expect(screen.getByText("Apply Compliance Units")).toBeVisible();

    // Check BCCR account section headers
    expect(screen.getByText("Enter account ID")).toBeVisible();
    expect(screen.getByText("BCCR Holding Account ID:*")).toBeVisible();

    // Check help text
    const helpText = screen.getByText(/No account\?/);
    expect(helpText).toBeVisible();
    const createAccountLink = screen.getByRole("link", {
      name: "Create account",
    });
    expect(createAccountLink).toBeVisible();
    expect(createAccountLink).toHaveAttribute("target", "_blank");
    expect(createAccountLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("updates form data when onValidAccountResolved is called", async () => {
    render(<ComplianceUnitsApplyComponent complianceSummaryId="123" />);

    // Get the BCCR Holding Account ID input
    const accountInput = screen.getByRole("textbox");
    expect(accountInput).toBeInTheDocument();

    // Enter a valid 15-digit account number
    fireEvent.change(accountInput, { target: { value: "123456789012345" } });

    // Wait for the trading name to appear (account details fetched and resolved)
    const tradingNameLabel = await screen.findByText("BCCR Trading Name:");
    expect(tradingNameLabel).toBeVisible();

    const tradingNameValue = await screen.findByText("Test Trading Co");
    expect(tradingNameValue).toBeVisible();
  });

  it("renders navigation buttons with correct states", () => {
    render(<ComplianceUnitsApplyComponent complianceSummaryId="123" />);

    // Check button text
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    const applyButton = screen.getByRole("button", { name: "Apply" });

    expect(cancelButton).toBeVisible();
    expect(applyButton).toBeVisible();

    // Check Apply button is disabled
    expect(applyButton).toBeDisabled();
  });
});
