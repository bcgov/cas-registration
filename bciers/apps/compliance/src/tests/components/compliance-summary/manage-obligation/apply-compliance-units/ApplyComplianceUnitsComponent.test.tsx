import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ApplyComplianceUnitsComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/apply-compliance-units/ApplyComplianceUnitsComponent";
import { getBccrAccountDetails } from "@/compliance/src/app/utils/bccrAccountHandlers";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import { actionHandler } from "@bciers/actions";

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

vi.mock("@/compliance/src/app/utils/bccrAccountHandlers", () => ({
  getBccrAccountDetails: vi.fn(),
  getBccrComplianceUnitsAccountDetails: vi.fn(),
}));

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock(
  "@/compliance/src/app/utils/getOperationByComplianceReportVersionId",
  () => ({
    default: vi.fn().mockResolvedValue({ name: "Test Operation" }),
  }),
);

const TEST_COMPLIANCE_REPORT_VERSION_ID = 123;
const VALID_ACCOUNT_ID = "123456789012345";
const MOCK_TRADING_NAME = "Test Company";
const MOCK_COMPLIANCE_ACCOUNT_ID = "COMP123";
const MOCK_CHARGE_RATE = 50;
const MOCK_OUTSTANDING_BALANCE = 16000;
const MOCK_CAP_LIMIT = 8000;
const MOCK_CAP_REMAINING = 4000;
const MOCK_UNITS = [
  {
    id: "1",
    type: "Earned Credits",
    serial_number: "EC123",
    vintage_year: 2024,
    quantity_available: 1000,
    quantity_to_be_applied: 0,
    equivalent_emission_reduced: 0,
    equivalent_value: 0,
  },
  {
    id: "2",
    type: "Offset Units",
    serial_number: "OU456",
    vintage_year: 2023,
    quantity_available: 500,
    quantity_to_be_applied: 0,
    equivalent_emission_reduced: 0,
    equivalent_value: 0,
  },
];

const setupMocks = () => {
  (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockResolvedValue({
    bccr_trading_name: MOCK_TRADING_NAME,
  });

  (actionHandler as ReturnType<typeof vi.fn>).mockResolvedValue({
    bccr_compliance_account_id: MOCK_COMPLIANCE_ACCOUNT_ID,
    bccr_units: MOCK_UNITS,
    charge_rate: MOCK_CHARGE_RATE,
    outstanding_balance: MOCK_OUTSTANDING_BALANCE,
    compliance_unit_cap_limit: MOCK_CAP_LIMIT,
    compliance_unit_cap_remaining: MOCK_CAP_REMAINING,
  });
};

const setupValidAccountAndSubmit = async () => {
  setupMocks();

  const renderResult = render(
    <ApplyComplianceUnitsComponent
      complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
      reportingYear={2024}
    />,
  );

  // Enter account ID
  const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
  fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

  await waitFor(() => {
    expect(screen.getByText(MOCK_TRADING_NAME)).toBeVisible();
  });

  // Check confirmation checkbox
  const checkbox = screen.getByRole("checkbox");
  fireEvent.click(checkbox);

  await waitFor(() => {
    expect(checkbox).toBeChecked();
  });

  // Submit to get compliance data
  const submitButton = screen.getByRole("button", { name: "Submit" });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText(MOCK_COMPLIANCE_ACCOUNT_ID)).toBeVisible();
    expect(
      screen.getByText("Indicate compliance units to be applied"),
    ).toBeVisible();
  });

  return renderResult;
};

describe("ApplyComplianceUnitsComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mock implementations to ensure clean state
    (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockReset();
    (actionHandler as ReturnType<typeof vi.fn>).mockReset();
  });

  it("displays form title and BCCR account section and input field", () => {
    render(
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
        reportingYear={2024}
      />,
    );

    expect(screen.getByText("Apply Compliance Units")).toBeVisible();
    expect(screen.getByText("Enter account ID")).toBeVisible();
    expect(screen.getByLabelText("BCCR Holding Account ID:*")).toBeVisible();
  });

  it("does not show compliance account and units initially", () => {
    render(
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
        reportingYear={2024}
      />,
    );
    expect(screen.queryByText("BCCR Trading Name:")).not.toBeInTheDocument();
    expect(
      screen.queryByText("BCCR Compliance Account ID:"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Indicate compliance units to be applied"),
    ).not.toBeInTheDocument();
  });

  it("validates account and displays compliance details on success", async () => {
    await setupValidAccountAndSubmit();

    expect(actionHandler).toHaveBeenCalledWith(
      `compliance/bccr/accounts/${VALID_ACCOUNT_ID}/compliance-report-versions/${TEST_COMPLIANCE_REPORT_VERSION_ID}/compliance-units`,
      "GET",
      "",
    );
    expect(screen.getByText("BCCR Trading Name:")).toBeVisible();
    expect(screen.getByText(MOCK_TRADING_NAME)).toBeVisible();
    expect(screen.getByText("BCCR Compliance Account ID:")).toBeVisible();
    expect(screen.getByText(MOCK_COMPLIANCE_ACCOUNT_ID)).toBeVisible();
    expect(
      screen.getByText("Indicate compliance units to be applied"),
    ).toBeVisible();
    // Check summary section
    expect(screen.getByText(/summary/i)).toBeVisible();
    expect(screen.getByText(/total quantity to be applied/i)).toBeVisible();
    expect(
      screen.getByText(/total equivalent emission reduced/i),
    ).toBeVisible();
    expect(screen.getByText(/total equivalent value/i)).toBeVisible();
    expect(screen.getByText(/outstanding balance/i)).toBeVisible();
  });

  it("does not show compliance details when account is invalid", async () => {
    // Mock account details to fail
    (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Invalid account"),
    );

    render(
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
        reportingYear={2024}
      />,
    );
    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

    await waitFor(() => {
      expect(getBccrAccountDetails).toHaveBeenCalledWith(
        VALID_ACCOUNT_ID,
        TEST_COMPLIANCE_REPORT_VERSION_ID,
      );
      // Should show error message instead of trading name
      expect(screen.getByText("Invalid account")).toBeVisible();
      expect(screen.queryByText("BCCR Trading Name:")).not.toBeInTheDocument();
    });
  });

  it("shows confirmation checkbox when trading name is loaded", async () => {
    (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      bccr_trading_name: MOCK_TRADING_NAME,
    });

    render(
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
        reportingYear={2024}
      />,
    );

    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

    await waitFor(() => {
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
      expect(
        screen.getByText(
          /By checking off the box above, you confirm that the B\.C\. Carbon Registry Holding Account was entered accurately and the Trading Name displays correctly\. Your confirmation will initiate the creation of a compliance account for Test Operation\./,
        ),
      ).toBeInTheDocument();
    });
  });

  it("enables Submit button when confirmation checkbox is checked", async () => {
    (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      bccr_trading_name: MOCK_TRADING_NAME,
    });

    render(
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
        reportingYear={2024}
      />,
    );

    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

    await waitFor(() => {
      expect(screen.getByText(MOCK_TRADING_NAME)).toBeVisible();
    });

    // Wait for the checkbox to appear
    await waitFor(() => {
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    // First check if Submit button exists and is initially disabled
    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeVisible();
      expect(submitButton).toBeDisabled();
    });

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    // Wait for state to update
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });

    // Wait for submit button to be enabled
    await waitFor(
      () => {
        const submitButton = screen.getByRole("button", { name: "Submit" });
        expect(submitButton).not.toBeDisabled();
      },
      { timeout: 3000 },
    );
  });

  it("handles account validation errors", async () => {
    (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Invalid account"),
    );

    render(
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
        reportingYear={2024}
      />,
    );

    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

    await waitFor(() => {
      expect(screen.getByText("Invalid account")).toBeVisible();
    });
  });

  it("hides confirmation checkbox when invalid account is entered after valid one", async () => {
    // First, enter a valid account
    (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      bccr_trading_name: MOCK_TRADING_NAME,
    });

    render(
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
        reportingYear={2024}
      />,
    );

    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

    // Wait for valid account confirmation to appear
    await waitFor(() => {
      expect(screen.getByText(MOCK_TRADING_NAME)).toBeVisible();
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    // Now enter an invalid account (null trading name response)
    (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      bccr_trading_name: null,
    });

    fireEvent.change(accountInput, { target: { value: "999999999999999" } });

    // Wait for the error state and confirm checkbox is hidden
    await waitFor(() => {
      expect(
        screen.getByText(
          /please enter a valid bccr holding account id to move to the next step/i,
        ),
      ).toBeVisible();
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
      expect(screen.queryByText("BCCR Trading Name:")).not.toBeInTheDocument();
    });
  });

  it("submits form and calls GET API to fetch compliance data", async () => {
    (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      bccr_trading_name: MOCK_TRADING_NAME,
    });

    (actionHandler as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      bccr_compliance_account_id: MOCK_COMPLIANCE_ACCOUNT_ID,
      bccr_units: MOCK_UNITS,
      charge_rate: MOCK_CHARGE_RATE,
      outstanding_balance: MOCK_OUTSTANDING_BALANCE,
    });

    render(
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
        reportingYear={2024}
      />,
    );

    // Enter account ID
    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

    await waitFor(() => {
      expect(screen.getByText(MOCK_TRADING_NAME)).toBeVisible();
    });

    // Wait for checkbox to appear then check it
    await waitFor(() => {
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    // Wait for checkbox state to update
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });

    // Wait for submit button to be enabled, then click it
    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeVisible();
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        `compliance/bccr/accounts/${VALID_ACCOUNT_ID}/compliance-report-versions/${TEST_COMPLIANCE_REPORT_VERSION_ID}/compliance-units`,
        "GET",
        "",
      );
    });
  });

  it("displays compliance data after successful submission", async () => {
    await setupValidAccountAndSubmit();

    // Check that compliance data is displayed
    expect(screen.getByText("BCCR Compliance Account ID:")).toBeVisible();
    expect(screen.getByText(MOCK_COMPLIANCE_ACCOUNT_ID)).toBeVisible();
    expect(
      screen.getByText("Indicate compliance units to be applied"),
    ).toBeVisible();

    // Check summary section is displayed
    expect(screen.getByText("Summary")).toBeVisible();
    expect(screen.getByText("Total Quantity to be Applied:")).toBeVisible();
    expect(
      screen.getByText("Total Equivalent Emission Reduced:"),
    ).toBeVisible();
    expect(screen.getByText("Total Equivalent Value:")).toBeVisible();
    expect(
      screen.getByText("Outstanding Balance after Applying Compliance Units:"),
    ).toBeVisible();
  });

  it("calculates summary values correctly when units are selected", async () => {
    await setupValidAccountAndSubmit();

    // Find and update quantity for first unit
    const quantityInputs = screen.getAllByLabelText("quantity_to_be_applied");
    fireEvent.change(quantityInputs[0], { target: { value: "100" } });

    await waitFor(() => {
      // Check calculations: 100 units * $50 charge rate = $5000
      // Outstanding balance: $16000 - $5000 = $11000
      expect(
        document.getElementById("root_total_quantity_to_be_applied"),
      ).toHaveTextContent("100"); // Total quantity
      expect(
        document.getElementById("root_total_equivalent_emission_reduced"),
      ).toHaveTextContent("100 tCO2e"); // Total equivalent emission reduced
      expect(
        document.getElementById("root_total_equivalent_value"),
      ).toHaveTextContent("$5,000.00"); // Total equivalent value
      expect(
        document.getElementById("root_outstanding_balance"),
      ).toHaveTextContent("$11,000.00"); // Outstanding balance
    });
  });

  it("shows Apply button when compliance data is loaded and units exist", async () => {
    await setupValidAccountAndSubmit();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Apply" })).toBeVisible();
    });
  });

  it("enables Apply button when units are selected and below 50% limit", async () => {
    await setupValidAccountAndSubmit();

    // Wait for quantity inputs to be available
    await waitFor(() => {
      expect(
        screen.getAllByLabelText("quantity_to_be_applied").length,
      ).toBeGreaterThan(0);
    });

    // Select units below 50% limit (8000/50 = 160 units max, so 50% is 80 units)
    const quantityInputs = screen.getAllByLabelText("quantity_to_be_applied");
    // Change value to something below 80, e.g., 50
    fireEvent.change(quantityInputs[0], { target: { value: "50" } });

    await waitFor(() => {
      const applyButton = screen.getByRole("button", { name: "Apply" });
      expect(applyButton).not.toBeDisabled();
    });
  });

  it("disables Apply button when units exceed 50% compliance limit", async () => {
    await setupValidAccountAndSubmit();

    // Wait for quantity inputs to be available
    await waitFor(() => {
      expect(
        screen.getAllByLabelText("quantity_to_be_applied").length,
      ).toBeGreaterThan(0);
    });

    // Select units that exceed 50% limit (8000/50 = 160 units max)
    const quantityInputs = screen.getAllByLabelText("quantity_to_be_applied");
    fireEvent.change(quantityInputs[0], { target: { value: "200" } });

    await waitFor(() => {
      const applyButton = screen.getByRole("button", { name: "Apply" });
      expect(applyButton).toBeDisabled();

      // Check warning message
      expect(
        screen.getByText(
          /at least 50% of the compliance obligation must be met with monetary payment/i,
        ),
      ).toBeVisible();
    });
  });

  it("enables Apply button when units equal exactly 50% compliance limit", async () => {
    await setupValidAccountAndSubmit();

    // Select units that equal exactly 50% limit (4000 units / 50 charge rate = 80 units)
    const quantityInputs = screen.getAllByLabelText("quantity_to_be_applied");
    fireEvent.change(quantityInputs[0], { target: { value: "80" } });

    await waitFor(() => {
      const applyButton = screen.getByRole("button", { name: "Apply" });
      expect(applyButton).not.toBeDisabled();

      // Check info message for exact 50%
      expect(
        screen.getByText(
          /the compliance units.*have reached 50% of the compliance obligation/i,
        ),
      ).toBeVisible();
    });
  });

  it("calls POST API when Apply button is clicked", async () => {
    // Mock successful apply response
    (actionHandler as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        bccr_compliance_account_id: MOCK_COMPLIANCE_ACCOUNT_ID,
        bccr_units: MOCK_UNITS,
        charge_rate: MOCK_CHARGE_RATE,
        outstanding_balance: MOCK_OUTSTANDING_BALANCE,
      })
      .mockResolvedValueOnce({ success: true });

    await setupValidAccountAndSubmit();

    // Select some units
    const quantityInputs = screen.getAllByLabelText("quantity_to_be_applied");
    fireEvent.change(quantityInputs[0], { target: { value: "75" } });

    await waitFor(() => {
      const applyButton = screen.getByRole("button", { name: "Apply" });
      expect(applyButton).not.toBeDisabled();
    });

    const applyButton = screen.getByRole("button", { name: "Apply" });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(actionHandler).toHaveBeenLastCalledWith(
        `compliance/bccr/accounts/${VALID_ACCOUNT_ID}/compliance-report-versions/${TEST_COMPLIANCE_REPORT_VERSION_ID}/compliance-units`,
        "POST",
        "",
        {
          body: expect.stringContaining('"quantity_to_be_applied":75'),
        },
      );
    });
  });

  it("shows success message and hides Apply button after successful application", async () => {
    // Mock successful apply response
    (actionHandler as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        bccr_compliance_account_id: MOCK_COMPLIANCE_ACCOUNT_ID,
        bccr_units: MOCK_UNITS,
        charge_rate: MOCK_CHARGE_RATE,
        outstanding_balance: MOCK_OUTSTANDING_BALANCE,
      })
      .mockResolvedValueOnce({ success: true });

    await setupValidAccountAndSubmit();

    // Wait for quantity inputs to be available
    await waitFor(() => {
      expect(
        screen.getAllByLabelText("quantity_to_be_applied").length,
      ).toBeGreaterThan(0);
    });

    // Select some units
    const quantityInputs = screen.getAllByLabelText("quantity_to_be_applied");
    fireEvent.change(quantityInputs[0], { target: { value: "75" } });

    const applyButton = screen.getByRole("button", { name: "Apply" });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(
        screen.getByText((content) =>
          content.includes(
            "have been applied towards the compliance obligation successfully",
          ),
        ),
      ).toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Apply" }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Back" })).toBeVisible();
    });
  });

  it("handles Apply button submission errors correctly", async () => {
    // Mock successful response for initial setup, then error for apply
    (actionHandler as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        bccr_compliance_account_id: MOCK_COMPLIANCE_ACCOUNT_ID,
        bccr_units: MOCK_UNITS,
        charge_rate: MOCK_CHARGE_RATE,
        outstanding_balance: MOCK_OUTSTANDING_BALANCE,
      })
      .mockResolvedValueOnce({ error: "Failed to apply compliance units" });

    await setupValidAccountAndSubmit();

    // Wait for quantity inputs to be available
    await waitFor(() => {
      expect(
        screen.getAllByLabelText("quantity_to_be_applied").length,
      ).toBeGreaterThan(0);
    });

    // Select some units
    const quantityInputs = screen.getAllByLabelText("quantity_to_be_applied");
    fireEvent.change(quantityInputs[0], { target: { value: "75" } });

    const applyButton = screen.getByRole("button", { name: "Apply" });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to apply compliance units"),
      ).toBeVisible();
    });
  });

  it("shows loading state when applying compliance units", async () => {
    // Mock delayed apply response
    (actionHandler as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        bccr_compliance_account_id: MOCK_COMPLIANCE_ACCOUNT_ID,
        bccr_units: MOCK_UNITS,
        charge_rate: MOCK_CHARGE_RATE,
        outstanding_balance: MOCK_OUTSTANDING_BALANCE,
      })
      .mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({}), 100)),
      );

    await setupValidAccountAndSubmit();

    // Select some units
    const quantityInputs = screen.getAllByLabelText("quantity_to_be_applied");
    fireEvent.change(quantityInputs[0], { target: { value: "75" } });

    const applyButton = screen.getByRole("button", { name: "Apply" });
    fireEvent.click(applyButton);

    // Check loading state
    expect(applyButton).toBeDisabled();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("maintains correct outstanding balance calculations with precise values", async () => {
    await setupValidAccountAndSubmit();

    // Test calculations with standard JavaScript numbers
    const quantityInputs = screen.getAllByLabelText("quantity_to_be_applied");
    fireEvent.change(quantityInputs[0], { target: { value: "123" } });

    await waitFor(() => {
      const expectedValue = 123 * MOCK_CHARGE_RATE; // 123 * 50 = 6150
      const expectedBalance = MOCK_OUTSTANDING_BALANCE - expectedValue; // 16000 - 6150 = 9850

      // Use specific element IDs to avoid multiple matches
      expect(
        document.getElementById("root_total_equivalent_value"),
      ).toHaveTextContent(
        `$${expectedValue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      );
      expect(
        document.getElementById("root_outstanding_balance"),
      ).toHaveTextContent(
        `$${expectedBalance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      );
    });
  });

  it("handles submission errors correctly", async () => {
    (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      bccr_trading_name: MOCK_TRADING_NAME,
    });

    (actionHandler as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      error: "API Error",
    });

    render(
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
        reportingYear={2024}
      />,
    );

    // Enter account ID
    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

    await waitFor(() => {
      expect(screen.getByText(MOCK_TRADING_NAME)).toBeVisible();
    });

    // Wait for checkbox to appear then check it
    await waitFor(() => {
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    // Wait for checkbox state to update
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });

    // Wait for submit button to be enabled, then click it
    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeVisible();
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("API Error")).toBeVisible();
    });
  });

  it("clears form data when account ID is changed", async () => {
    (getBccrAccountDetails as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        bccr_trading_name: MOCK_TRADING_NAME,
      })
      .mockResolvedValueOnce({
        bccr_trading_name: "New Company",
      });

    render(
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
        reportingYear={2024}
      />,
    );

    // Enter first account
    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

    await waitFor(() => {
      expect(screen.getByText(MOCK_TRADING_NAME)).toBeVisible();
    });

    // Change to different account
    fireEvent.change(accountInput, { target: { value: "987654321098765" } });

    await waitFor(() => {
      expect(screen.queryByText(MOCK_TRADING_NAME)).not.toBeInTheDocument();
      expect(screen.getByText("New Company")).toBeVisible();
    });
  });

  it("navigates to correct URL when Cancel button is clicked", () => {
    render(
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
        reportingYear={2024}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      `/compliance-summaries/${TEST_COMPLIANCE_REPORT_VERSION_ID}/manage-obligation-review-summary`,
    );
  });

  it("shows loading state when submitting", async () => {
    (getBccrAccountDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      bccr_trading_name: MOCK_TRADING_NAME,
    });

    // Mock a delayed response
    (actionHandler as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 100)),
    );

    render(
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
        reportingYear={2024}
      />,
    );
    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

    await waitFor(() => {
      expect(screen.getByText(MOCK_TRADING_NAME)).toBeVisible();
    });

    const checkbox = screen.getByLabelText(
      /I confirm the accuracy of the information above/,
    );
    fireEvent.click(checkbox);

    // Click submit and check loading state
    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);

    // Check that button is disabled during submission
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders all initial form sections", () => {
    render(
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
        reportingYear={2024}
      />,
    );

    // Check that initial form sections are present
    expect(screen.getByText("Apply Compliance Units")).toBeVisible();
    expect(screen.getByText("Enter account ID")).toBeVisible();
    expect(
      screen.getByLabelText("BCCR Holding Account ID:*"),
    ).toBeInTheDocument();

    // Trading name should not be visible initially
    expect(screen.queryByText("BCCR Trading Name:")).not.toBeInTheDocument();
  });

  it("handles empty account ID gracefully", () => {
    render(
      <ApplyComplianceUnitsComponent
        complianceReportVersionId={TEST_COMPLIANCE_REPORT_VERSION_ID}
        reportingYear={2024}
      />,
    );

    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: "" } });

    // Should not trigger validation or show errors for empty value
    expect(getBccrAccountDetails).not.toHaveBeenCalled();
  });

  it("displays units grid with correct columns and data", async () => {
    // Explicitly setup mocks for this test to ensure isolation
    setupMocks();

    await setupValidAccountAndSubmit();

    // Wait for the compliance account ID to be visible before checking other elements
    await waitFor(() => {
      expect(screen.getByText(MOCK_COMPLIANCE_ACCOUNT_ID)).toBeVisible();
    });

    // Check that units are displayed with correct headers
    expect(screen.getByText("Type")).toBeVisible();
    expect(screen.getByText("Serial Number")).toBeVisible();
    expect(screen.getByText("Vintage Year")).toBeVisible();
    expect(screen.getByText("Quantity Available")).toBeVisible();
    expect(screen.getByText("Quantity to be Applied")).toBeVisible();
    expect(screen.getByText("Equivalent Emission Reduced")).toBeVisible();

    // Check that mock units data is displayed
    expect(screen.getByText("Earned Credits")).toBeVisible();
    expect(screen.getByText("Offset Units")).toBeVisible();
    expect(screen.getByText("EC123")).toBeVisible();
    expect(screen.getByText("OU456")).toBeVisible();
    expect(screen.getByText("2024")).toBeVisible();
    expect(screen.getByText("2023")).toBeVisible();
  });

  it("allows updating multiple units and calculates combined totals", async () => {
    await setupValidAccountAndSubmit();

    // Update quantities for both units
    await waitFor(() => {
      expect(
        screen.getAllByLabelText("quantity_to_be_applied").length,
      ).toBeGreaterThan(1);
    });
    const quantityInputs = screen.getAllByLabelText("quantity_to_be_applied");
    fireEvent.change(quantityInputs[0], { target: { value: "50" } });
    fireEvent.change(quantityInputs[1], { target: { value: "25" } });

    await waitFor(() => {
      // Combined: 50 + 25 = 75 units
      // Value: 75 * $50 = $3750
      // Balance: $16000 - $3750 = $12250
      expect(
        document.getElementById("root_total_quantity_to_be_applied"),
      ).toHaveTextContent("75");
      expect(
        document.getElementById("root_total_equivalent_emission_reduced"),
      ).toHaveTextContent("75 tCO2e");
      expect(screen.getByText("$3,750.00")).toBeVisible(); // Total value
      expect(screen.getByText("$12,250.00")).toBeVisible(); // Outstanding balance
    });
  });

  it("prevents applying more units than available quantity", async () => {
    await setupValidAccountAndSubmit();

    // Wait for quantity inputs to be available
    await waitFor(() => {
      expect(
        screen.getAllByLabelText("quantity_to_be_applied").length,
      ).toBeGreaterThan(0);
    });

    // Try to enter more than available (1000 is max for first unit)
    const quantityInputs = screen.getAllByLabelText("quantity_to_be_applied");
    fireEvent.change(quantityInputs[0], { target: { value: "1500" } });

    await waitFor(() => {
      // Should be capped at 1000 (quantity_available)
      expect(
        document.getElementById("root_total_quantity_to_be_applied"),
      ).toHaveTextContent("1000");
      expect(
        document.getElementById("root_total_equivalent_value"),
      ).toHaveTextContent("$50,000.00"); // 1000 * 50
    });
  });
});
