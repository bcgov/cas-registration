import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RequestIssuanceOfEarnedCreditsComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsComponent";
import { useRouter } from "@bciers/testConfig/mocks";
import { getBccrAccountDetails } from "@/compliance/src/app/utils/bccrAccountHandlers";
import { actionHandler } from "@bciers/actions";

const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

vi.mock("@/compliance/src/app/utils/bccrAccountHandlers", () => ({
  getBccrAccountDetails: vi.fn(),
}));

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const TEST_COMPLIANCE_REPORT_VERSION_ID = 123;
const VALID_ACCOUNT_ID = "123456789012345";
const INVALID_ACCOUNT_ID = "123";
const MOCK_TRADING_NAME = "Test Company";

const setupValidAccount = async () => {
  (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    bccr_trading_name: MOCK_TRADING_NAME,
  });

  render(
    <RequestIssuanceOfEarnedCreditsComponent
      complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
    />,
  );
  const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
  fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

  await waitFor(() => {
    expect(screen.getByText(MOCK_TRADING_NAME)).toBeVisible();
  });

  return accountInput;
};

describe("RequestIssuanceOfEarnedCreditsComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays form title and BCCR account section", () => {
    render(
      <RequestIssuanceOfEarnedCreditsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
      />,
    );

    expect(
      screen.getByText("Request Issuance of Earned Credits"),
    ).toBeVisible();
    expect(
      screen.getByText("B.C. Carbon Registry (BCCR) Account Information"),
    ).toBeVisible();
  });

  it("shows BCCR account input field", () => {
    render(
      <RequestIssuanceOfEarnedCreditsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
      />,
    );

    const accountIdField = screen.getByLabelText("BCCR Holding Account ID:*");
    expect(accountIdField).toBeVisible();
  });

  it("does not show BCCR trading name initially", () => {
    render(
      <RequestIssuanceOfEarnedCreditsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
      />,
    );
    expect(screen.queryByText("BCCR Trading Name:")).not.toBeInTheDocument();
  });

  it("validates account and displays trading name on success", async () => {
    await setupValidAccount();

    expect(getBccrAccountDetails).toHaveBeenCalledWith(
      VALID_ACCOUNT_ID,
      TEST_COMPLIANCE_REPORT_VERSION_ID,
    );
    expect(screen.getByText("BCCR Trading Name:")).toBeVisible();
    expect(screen.getByText(MOCK_TRADING_NAME)).toBeVisible();
  });

  it("does not show trading name when account is invalid", async () => {
    (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Invalid account"),
    );

    render(
      <RequestIssuanceOfEarnedCreditsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
      />,
    );
    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });
    expect(screen.queryByText("BCCR Trading Name:")).not.toBeInTheDocument();
  });

  it("clears trading name when account ID changes", async () => {
    const accountInput = await setupValidAccount();

    // Change to a different valid account
    (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      bccr_trading_name: "New Company",
    });
    fireEvent.change(accountInput, { target: { value: "987654321098765" } });

    await waitFor(() => {
      expect(screen.queryByText(MOCK_TRADING_NAME)).not.toBeInTheDocument();
    });
  });

  it("enables continue button only with valid account", async () => {
    const accountInput = await setupValidAccount();

    const backButton = screen.getByRole("button", { name: "Back" });
    const continueButton = screen.getByRole("button", {
      name: "Requests Issuance of Earned Credits",
    });

    // Should be enabled after valid account
    expect(backButton).not.toBeDisabled();
    expect(continueButton).not.toBeDisabled();

    // Change to invalid account
    fireEvent.change(accountInput, { target: { value: INVALID_ACCOUNT_ID } });

    // Should be disabled with invalid account
    const disabledContinueButton = screen.getByRole("button", {
      name: "Requests Issuance of Earned Credits",
    });
    expect(disabledContinueButton).toBeDisabled();
  });

  it("calls actionHandler with correct parameters when submitting and navigating to the next page", async () => {
    (actionHandler as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});
    await setupValidAccount();

    const backButton = screen.getByRole("button", { name: "Back" });
    fireEvent.click(backButton);
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/compliance-summaries/${TEST_COMPLIANCE_REPORT_VERSION_ID}/request-issuance-review-summary`,
    );

    const continueButton = screen.getByRole("button", {
      name: "Requests Issuance of Earned Credits",
    });
    fireEvent.click(continueButton);

    // Verify that actionHandler was called with correct parameters
    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        `compliance/compliance-report-versions/${TEST_COMPLIANCE_REPORT_VERSION_ID}/earned-credits`,
        "PUT",
        "",
        {
          body: JSON.stringify({
            bccr_holding_account_id: VALID_ACCOUNT_ID,
            bccr_trading_name: MOCK_TRADING_NAME,
          }),
        },
      );
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        `/compliance-summaries/${TEST_COMPLIANCE_REPORT_VERSION_ID}/track-status-of-issuance`,
      );
    });
  });

  it("shows error message when validation fails", async () => {
    (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Unknown error"),
    );

    render(
      <RequestIssuanceOfEarnedCreditsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
      />,
    );
    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

    await waitFor(() => {
      expect(screen.getByText("Unknown error")).toBeVisible();
    });
  });

  it("shows loading state when submitting form", async () => {
    (actionHandler as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 100)),
    );

    await setupValidAccount();

    const continueButton = screen.getByRole("button", {
      name: "Requests Issuance of Earned Credits",
    });
    fireEvent.click(continueButton);

    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeVisible();
    expect(continueButton).toBeDisabled();
  });

  it("handles submission error correctly", async () => {
    (actionHandler as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      error: "Failed to create project in BCCR",
    });

    await setupValidAccount();

    const continueButton = screen.getByRole("button", {
      name: "Requests Issuance of Earned Credits",
    });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to create project in BCCR"),
      ).toBeVisible();
      // Submit button should be enabled again
      expect(continueButton).not.toBeDisabled();
    });
  });

  it("clears existing error when form data changes", async () => {
    (actionHandler as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      error: "Failed to create project in BCCR",
    });
    await setupValidAccount();

    const continueButton = screen.getByRole("button", {
      name: "Requests Issuance of Earned Credits",
    });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to create project in BCCR"),
      ).toBeVisible();
    });

    // Change account ID to clear the error
    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: "987654321098765" } });

    await waitFor(() => {
      expect(
        screen.queryByText("Failed to create project in BCCR"),
      ).not.toBeInTheDocument();
    });
  });

  it("handles empty trading name from API response", async () => {
    (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      bccr_trading_name: null,
    });

    render(
      <RequestIssuanceOfEarnedCreditsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
      />,
    );
    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Requests Issuance of Earned Credits",
        }),
      ).toBeDisabled();
    });
  });
});
