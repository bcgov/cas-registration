import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RequestIssuanceOfEarnedCreditsComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsComponent";
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

describe("RequestIssuanceOfEarnedCreditsComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with correct schema fields and headers", () => {
    render(
      <RequestIssuanceOfEarnedCreditsComponent complianceSummaryId="123" />,
    );

    // Check form title
    expect(
      screen.getByText("Request Issuance of Earned Credits"),
    ).toBeVisible();

    // Check BCCR account section header
    expect(
      screen.getByText("B.C. Carbon Registry (BCCR) Account Information"),
    ).toBeVisible();

    // Check BCCR Holding Account ID field
    const accountIdField = screen.getByLabelText("BCCR Holding Account ID:*");
    expect(accountIdField).toBeVisible();

    // Check help text
    const helpText = screen.getByText(/No account\?/);
    expect(helpText).toBeVisible();
    const createAccountLink = screen.getByRole("link", {
      name: "Create account",
    });
    expect(createAccountLink).toBeVisible();
    expect(createAccountLink).toHaveAttribute("target", "_blank");
    expect(createAccountLink).toHaveAttribute("rel", "noopener noreferrer");

    // BCCR Trading Name field should not be visible initially
    expect(screen.queryByText("BCCR Trading Name:")).not.toBeInTheDocument();
  });

  it("updates form data when onValidAccountResolved is called", async () => {
    render(
      <RequestIssuanceOfEarnedCreditsComponent complianceSummaryId="123" />,
    );

    // Get the BCCR Holding Account ID input
    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");

    // Enter a valid 15-digit account number
    fireEvent.change(accountInput, { target: { value: "123456789012345" } });

    // Wait for the trading name to appear (account details fetched and resolved)
    const tradingNameLabel = await screen.findByText("BCCR Trading Name:");
    expect(tradingNameLabel).toBeVisible();

    const tradingNameValue = await screen.findByText("Test Trading Co");
    expect(tradingNameValue).toBeVisible();
  });

  it("renders navigation buttons with correct states", () => {
    render(
      <RequestIssuanceOfEarnedCreditsComponent complianceSummaryId="123" />,
    );

    // Check button text and states
    const backButton = screen.getByRole("button", { name: "Back" });
    expect(backButton).toBeVisible();
    expect(backButton).not.toBeDisabled();

    const requestButton = screen.getByRole("button", {
      name: "Requests Issuance of Earned Credits",
    });
    expect(requestButton).toBeVisible();
    expect(requestButton).toBeDisabled(); // Disabled initially since bccrTradingName is not set

    // Verify router push is called with correct URLs when buttons are clicked
    fireEvent.click(backButton);
    expect(mockRouterPush).toHaveBeenCalledWith(
      "/compliance-summaries/123/request-issuance-review-summary",
    );

    // Enter valid account details to enable the continue button
    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: "123456789012345" } });

    // Wait for the trading name to appear and button to be enabled
    return waitFor(() => {
      const enabledRequestButton = screen.getByRole("button", {
        name: "Requests Issuance of Earned Credits",
      });
      expect(enabledRequestButton).not.toBeDisabled();

      // Click the enabled button and verify navigation
      fireEvent.click(enabledRequestButton);
      expect(mockRouterPush).toHaveBeenCalledWith(
        "/compliance-summaries/123/track-status-of-issuance",
      );
    });
  });
});
