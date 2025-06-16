import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import ApplyComplianceUnitsComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/apply-compliance-units/ApplyComplianceUnitsComponent";
import { getBccrComplianceUnitsAccountDetails } from "@/compliance/src/app/utils/bccrAccountHandlers";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

vi.mock("@/compliance/src/app/utils/bccrAccountHandlers", () => ({
  getBccrComplianceUnitsAccountDetails: vi.fn(),
}));

const TEST_COMPLIANCE_SUMMARY_ID = "123";
const VALID_ACCOUNT_ID = "123456789012345";
const MOCK_TRADING_NAME = "Test Company";
const MOCK_COMPLIANCE_ACCOUNT_ID = "COMP123";
const MOCK_CHARGE_RATE = 50;
const MOCK_OUTSTANDING_BALANCE = 16000;
const MOCK_UNITS = [
  {
    id: "1",
    type: "Earned Credits",
    serial_number: "EC123",
    vintage_year: 2024,
    quantity_available: "1000",
    quantity_to_be_applied: 0,
  },
];

const setupValidAccount = async () => {
  (
    getBccrComplianceUnitsAccountDetails as ReturnType<typeof vi.fn>
  ).mockResolvedValueOnce({
    bccr_trading_name: MOCK_TRADING_NAME,
    bccr_compliance_account_id: MOCK_COMPLIANCE_ACCOUNT_ID,
    bccr_units: MOCK_UNITS,
    charge_rate: MOCK_CHARGE_RATE,
    outstanding_balance: MOCK_OUTSTANDING_BALANCE,
  });

  const renderResult = render(
    <ApplyComplianceUnitsComponent
      complianceSummaryId={TEST_COMPLIANCE_SUMMARY_ID}
    />,
  );

  const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
  fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

  await waitFor(() => {
    expect(screen.getByText(MOCK_TRADING_NAME)).toBeVisible();
  });

  return renderResult;
};

describe("ApplyComplianceUnitsComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays form title and BCCR account section and input field", () => {
    render(
      <ApplyComplianceUnitsComponent
        complianceSummaryId={TEST_COMPLIANCE_SUMMARY_ID}
      />,
    );

    expect(screen.getByText("Apply Compliance Units")).toBeVisible();
    expect(screen.getByText("Enter account ID")).toBeVisible();
    expect(screen.getByLabelText("BCCR Holding Account ID:*")).toBeVisible();
  });

  it("does not show compliance account and units initially", () => {
    render(
      <ApplyComplianceUnitsComponent
        complianceSummaryId={TEST_COMPLIANCE_SUMMARY_ID}
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
    await setupValidAccount();

    expect(getBccrComplianceUnitsAccountDetails).toHaveBeenCalledWith(
      VALID_ACCOUNT_ID,
      TEST_COMPLIANCE_SUMMARY_ID,
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
    (
      getBccrComplianceUnitsAccountDetails as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error("Unknown error"));

    render(
      <ApplyComplianceUnitsComponent
        complianceSummaryId={TEST_COMPLIANCE_SUMMARY_ID}
      />,
    );
    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

    expect(screen.queryByText("BCCR Trading Name:")).not.toBeInTheDocument();
    expect(
      screen.queryByText("BCCR Compliance Account ID:"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Indicate compliance units to be applied"),
    ).not.toBeInTheDocument();
    // Summary section
    expect(screen.queryByText(/summary/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/total quantity to be applied/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/total equivalent emission reduced/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/total equivalent value/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/outstanding balance/i)).not.toBeInTheDocument();
  });

  it("clears compliance details when account ID changes", async () => {
    const { container } = await setupValidAccount();

    // Change to a different valid account
    (
      getBccrComplianceUnitsAccountDetails as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      bccr_trading_name: "New Company",
      bccr_compliance_account_id: "COMP456",
      charge_rate: MOCK_CHARGE_RATE,
      outstanding_balance: MOCK_OUTSTANDING_BALANCE,
      bccr_units: MOCK_UNITS,
    });
    fireEvent.change(container.querySelector("input") as HTMLInputElement, {
      target: { value: "987654321098765" },
    });

    await waitFor(() => {
      expect(screen.queryByText(MOCK_TRADING_NAME)).not.toBeInTheDocument();
      expect(
        screen.queryByText(MOCK_COMPLIANCE_ACCOUNT_ID),
      ).not.toBeInTheDocument();
    });
  });

  it("calculates summary values correctly and shows ApplyComplianceUnitsAlertNote", async () => {
    await setupValidAccount();

    const quantityInput = screen.getByLabelText("quantity_to_be_applied");
    fireEvent.change(quantityInput, { target: { value: "75" } });

    await waitFor(() => {
      expect(
        screen.getByText(
          /by clicking the “apply” button below, you confirm that you want to apply compliance units \(earned credits, offset units\) towards this operation’s compliance obligation by moving the units from your b\.c\. carbon registry holding account to the compliance account identified above\./i,
        ),
      ).toBeVisible();
      expect(screen.getByText("Total Quantity to be Applied:")).toBeVisible();
      expect(
        screen.getByText("Total Equivalent Emission Reduced:"),
      ).toBeVisible();
      expect(screen.getAllByText("75")).toHaveLength(2);
      expect(screen.getByText("Total Equivalent Value:")).toBeVisible();
      expect(screen.getByText("$3,750.00")).toBeVisible();
      expect(
        screen.getByText(
          "Outstanding Balance after Applying Compliance Units:",
        ),
      ).toBeVisible();
      expect(screen.getByText("12250")).toBeVisible();
    });
  });

  it("shows ApplyComplianceUnitsSuccessAlertNote when form is submitted", async () => {
    await setupValidAccount();

    const quantityInput = screen.getByLabelText("quantity_to_be_applied");
    fireEvent.change(quantityInput, { target: { value: "75" } });

    const applyButton = screen.getByRole("button", { name: "Apply" });
    expect(applyButton).not.toBeDisabled();
    fireEvent.click(applyButton);

    expect(
      screen.getByText(
        /the compliance unit\(s\) have been applied towards the compliance obligation successfully\./i,
      ),
    ).toBeVisible();
  });

  it("disables the apply button when selected units exceed 50% of the initial outstanding balance", async () => {
    await setupValidAccount();

    const quantityInput = screen.getByLabelText("quantity_to_be_applied");
    // Set quantity to 1000 to exceed the 50% limit of the initial outstanding balance (16000 * 0.5 = 8000)
    // With charge rate of 50, 1000 units = 50000 which exceeds 8000
    fireEvent.change(quantityInput, { target: { value: "1000" } });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
      expect(
        screen.getByText(
          /at least 50% of the compliance obligation must be met with monetary payment\(s\)\. the compliance units \(earned credits, offset units\) you selected below have exceeded the limit, please reduce the quantity to be applied to proceed\./i,
        ),
      ).toBeVisible();
    });
  });

  it("navigates to correct URL when cancel button is clicked", async () => {
    await setupValidAccount();

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      `/compliance-summaries/${TEST_COMPLIANCE_SUMMARY_ID}/manage-obligation-review-summary`,
    );
  });
  it("shows error message when validation fails", async () => {
    (
      getBccrComplianceUnitsAccountDetails as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error("Unknown error"));

    render(
      <ApplyComplianceUnitsComponent
        complianceSummaryId={TEST_COMPLIANCE_SUMMARY_ID}
      />,
    );
    const accountInput = screen.getByLabelText("BCCR Holding Account ID:*");
    fireEvent.change(accountInput, { target: { value: VALID_ACCOUNT_ID } });

    await waitFor(() => {
      expect(screen.getByText("Unknown error")).toBeVisible();
    });
  });
});
