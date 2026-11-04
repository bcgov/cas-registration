import BccrHoldingAccountWidget from "@/compliance/src/app/widgets/BccrHoldingAccountWidget";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { WidgetProps } from "@rjsf/utils";
import { vi } from "vitest";
import { skipA11yCheck } from "@bciers/testConfig/helpers/axe";

const mockValidateBccrAccount = vi.fn();
const mockOnChange = vi.fn();
const mockOnValidAccountResolved = vi.fn();
const mockOnError = vi.fn();
const TEST_COMPLIANCE_REPORT_VERSION_ID = 123;

const defaultProps = {
  onChange: mockOnChange,
  registry: {
    formContext: {
      onValidAccountResolved: mockOnValidAccountResolved,
      validateBccrAccount: mockValidateBccrAccount,
      onError: mockOnError,
      complianceReportVersionId: TEST_COMPLIANCE_REPORT_VERSION_ID,
    },
  },
} as unknown as WidgetProps;

describe("BccrHoldingAccountWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // The widget is rendered without the RJSF field template that provides its id and label
    skipA11yCheck(["label", "label-title-only"]);
  });

  it("renders input field with correct attributes", () => {
    render(<BccrHoldingAccountWidget {...defaultProps} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeVisible();
    expect(input).not.toBeDisabled();
  });

  it("allows only numeric input up to 15 digits", async () => {
    render(<BccrHoldingAccountWidget {...defaultProps} />);
    const input = screen.getByRole("textbox");

    // Test valid input
    fireEvent.change(input, { target: { value: "123" } });
    expect(mockOnChange).toHaveBeenCalledWith("123");

    // Test invalid input (letters)
    fireEvent.change(input, { target: { value: "abc" } });
    expect(mockOnChange).not.toHaveBeenCalledWith("abc");

    // Test input longer than 15 digits
    // (truncated to 15 digits, which kicks off async account validation)
    await act(async () => {
      fireEvent.change(input, { target: { value: "1234567890123456" } });
    });
    expect(mockOnChange).not.toHaveBeenCalledWith("1234567890123456");
  });

  it("shows loading state and input is disabled while validating account", async () => {
    mockValidateBccrAccount.mockImplementation(() => new Promise(() => {}));

    render(<BccrHoldingAccountWidget {...defaultProps} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "123456789012345" } });
    expect(screen.getByRole("progressbar")).toBeVisible();
    expect(mockOnValidAccountResolved).not.toHaveBeenCalled();
    expect(input).toBeDisabled();
  });

  it("shows error state for invalid account", async () => {
    mockValidateBccrAccount.mockResolvedValueOnce({
      bccr_trading_name: null,
    });

    render(<BccrHoldingAccountWidget {...defaultProps} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "123456789012345" } });

    await waitFor(() => {
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(
        screen.getByText(
          /please enter a valid bccr holding account id to move to the next step, or contact if you have any questions\./i,
        ),
      ).toBeVisible();
      expect(
        screen.getByRole("link", {
          name: /ghgregulator@gov\.bc\.ca/i,
        }),
      ).toHaveAttribute("href", "mailto:GHGRegulator@gov.bc.ca");
    });

    expect(mockOnValidAccountResolved).toHaveBeenCalledWith(undefined);
  });

  it("shows success state for valid account", async () => {
    const mockResponse = { bccr_trading_name: "Test Company" };
    mockValidateBccrAccount.mockResolvedValueOnce(mockResponse);

    render(<BccrHoldingAccountWidget {...defaultProps} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "123456789012345" } });

    await waitFor(() => {
      expect(screen.getByTestId("CheckCircleIcon")).toBeVisible();
    });

    expect(mockOnValidAccountResolved).toHaveBeenCalledWith(mockResponse);
    expect(mockOnError).toHaveBeenCalledWith(undefined);
  });

  it("handles validation errors", async () => {
    const errorMessage = "Network error";
    mockValidateBccrAccount.mockRejectedValueOnce(new Error(errorMessage));

    render(<BccrHoldingAccountWidget {...defaultProps} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "123456789012345" } });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith([errorMessage]);
      expect(mockOnValidAccountResolved).toHaveBeenCalledWith(undefined);
    });
  });

  it("shows a backend user_error inline with the email linked", async () => {
    const wrongAccountTypeError =
      "Please enter a BCCR Account ID with the account type 'Operator of Regulated Operation', or contact GHGRegulator@gov.bc.ca if you have any questions.";
    mockValidateBccrAccount.mockResolvedValueOnce({
      error: wrongAccountTypeError,
      validation: {
        message: wrongAccountTypeError,
        errors: [
          {
            key: "user_error",
            error: { severity: "Error", message: wrongAccountTypeError },
          },
        ],
      },
    });

    render(<BccrHoldingAccountWidget {...defaultProps} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "123456789012345" } });

    await waitFor(() => {
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(
        screen.getByText(
          /please enter a bccr account id with the account type 'operator of regulated operation', or contact/i,
        ),
      ).toBeVisible();
      expect(
        screen.getByRole("link", {
          name: /ghgregulator@gov\.bc\.ca/i,
        }),
      ).toHaveAttribute("href", "mailto:GHGRegulator@gov.bc.ca");
      expect(mockOnValidAccountResolved).toHaveBeenCalledWith(undefined);
    });
    expect(mockOnError).not.toHaveBeenCalledWith(expect.any(Array));
  });

  it("shows error message for remote BCCR API errors", async () => {
    render(<BccrHoldingAccountWidget {...defaultProps} />);
    mockValidateBccrAccount.mockResolvedValueOnce({
      bccr_trading_name: null,
      has_remote_bccr_errors: true,
    });
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "123456789012345" } });

    await waitFor(() => {
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(
        screen.getByText(
          /Remote BC Carbon Registry system issues, please try again later or contact/i,
        ),
      ).toBeVisible();
      expect(
        screen.getByRole("link", {
          name: /ghgregulator@gov\.bc\.ca/i,
        }),
      ).toHaveAttribute("href", "mailto:GHGRegulator@gov.bc.ca");
    });
  });

  it("shows a returned non-account error inline as an invalid account", async () => {
    mockValidateBccrAccount.mockResolvedValueOnce({
      error:
        "An internal server error has occurred. Please contact ghgregulator@gov.bc.ca for help.",
    });

    render(<BccrHoldingAccountWidget {...defaultProps} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "123456789012345" } });

    await waitFor(() => {
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(
        screen.getByText(
          /please enter a valid bccr holding account id to move to the next step/i,
        ),
      ).toBeVisible();
      expect(mockOnValidAccountResolved).toHaveBeenCalledWith(undefined);
    });
    expect(mockOnError).not.toHaveBeenCalledWith(expect.any(Array));
  });

  it("shows the BCCR error inline for a backend bccr_error response", async () => {
    mockValidateBccrAccount.mockResolvedValueOnce({
      error: "The system cannot connect to the external application.",
      validation: {
        errors: [
          {
            key: "bccr_error",
            error: {
              severity: "Error",
              message: "The system cannot connect to the external application.",
            },
          },
        ],
      },
    });

    render(<BccrHoldingAccountWidget {...defaultProps} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "123456789012345" } });

    await waitFor(() => {
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(
        screen.getByText(
          /Remote BC Carbon Registry system issues, please try again later or contact/i,
        ),
      ).toBeVisible();
    });
    expect(mockOnError).not.toHaveBeenCalledWith(expect.any(Array));
  });

  it("renders input with correct help text", () => {
    render(<BccrHoldingAccountWidget {...defaultProps} />);
    expect(screen.getByText(/no account\? in bccr\./i)).toBeVisible();

    const createAccountLink = screen.getByRole("link", {
      name: "Create account",
    });
    expect(createAccountLink).toHaveAttribute(
      "href",
      "https://carbonregistry.gov.bc.ca/bccarbonregistry",
    );

    expect(createAccountLink).toBeVisible();
    expect(createAccountLink).toHaveAttribute("target", "_blank");
    expect(createAccountLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("only calls validate function when input has 15 digits", async () => {
    render(<BccrHoldingAccountWidget {...defaultProps} />);
    const input = screen.getByRole("textbox");

    // Test with less than 15 digits
    fireEvent.change(input, { target: { value: "12345678901234" } });
    await waitFor(() => {
      expect(mockValidateBccrAccount).not.toHaveBeenCalled();
    });

    // Clear mock before next test
    vi.clearAllMocks();

    // Test with exactly 15 digits
    fireEvent.change(input, { target: { value: "123456789012345" } });
    await waitFor(() => {
      expect(mockValidateBccrAccount).toHaveBeenCalledWith(
        "123456789012345",
        TEST_COMPLIANCE_REPORT_VERSION_ID,
      );
    });

    // Clear mock before next test
    vi.clearAllMocks();

    // Test with less than 15 digits
    fireEvent.change(input, { target: { value: "12345678901234" } });
    await waitFor(() => {
      expect(mockValidateBccrAccount).not.toHaveBeenCalled();
    });
  });
});
