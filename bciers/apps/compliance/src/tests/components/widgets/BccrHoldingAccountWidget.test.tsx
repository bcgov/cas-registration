import BccrHoldingAccountWidget from "@/compliance/src/app/widgets/BccrHoldingAcountWidget";
import { actionHandler } from "@bciers/actions";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { vi } from "vitest";

// Mock the actionHandler
vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const mockActionHandler = actionHandler as vi.MockedFunction<
  typeof actionHandler
>;

const mockOnChange = vi.fn();
const mockOnValidAccountResolved = vi.fn();
const defaultProps: any = {
  id: "bccrHoldingAccountId",
  value: "",
  onChange: mockOnChange,
  formContext: {
    onValidAccountResolved: mockOnValidAccountResolved,
  },
};

describe("BccrHoldingAccountWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders input field with correct attributes", () => {
    render(<BccrHoldingAccountWidget {...defaultProps} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeVisible();
    expect(input).toHaveAttribute("id", "bccrHoldingAccountId");
    expect(input).not.toBeDisabled();
  });

  it("allows only numeric input up to 15 digits", () => {
    render(<BccrHoldingAccountWidget {...defaultProps} />);
    const input = screen.getByRole("textbox");

    // Test valid input
    fireEvent.change(input, { target: { value: "123" } });
    expect(mockOnChange).toHaveBeenCalledWith("123");

    // Test invalid input (letters)
    fireEvent.change(input, { target: { value: "abc" } });
    expect(mockOnChange).not.toHaveBeenCalledWith("abc");

    // Test input longer than 15 digits
    fireEvent.change(input, { target: { value: "1234567890123456" } });
    expect(mockOnChange).not.toHaveBeenCalledWith("1234567890123456");
  });

  it("shows error state for invalid account", async () => {
    mockActionHandler.mockResolvedValueOnce({
      tradingName: null,
    });

    render(<BccrHoldingAccountWidget {...defaultProps} />);
    const input = screen.getByRole("textbox");

    // Enter invalid account ID
    fireEvent.change(input, { target: { value: "123456789012345" } });

    await waitFor(() => {
      expect(screen.getByTestId("ErrorIcon")).toBeVisible();
    });

    expect(mockOnValidAccountResolved).toHaveBeenCalledWith(undefined);
  });

  it("disables input when disabled prop is true", () => {
    render(<BccrHoldingAccountWidget {...defaultProps} disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("disables input when readonly prop is true", () => {
    render(<BccrHoldingAccountWidget {...defaultProps} readonly />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("debounces API calls", async () => {
    vi.useFakeTimers();
    render(<BccrHoldingAccountWidget {...defaultProps} />);
    const input = screen.getByRole("textbox");

    // Type quickly
    await act(async () => {
      fireEvent.change(input, { target: { value: "1" } });
      fireEvent.change(input, { target: { value: "12" } });
      fireEvent.change(input, { target: { value: "123" } });
      await vi.runAllTimersAsync();
    });

    // Should only make one API call
    expect(actionHandler).toHaveBeenCalledTimes(0);

    // Enter complete valid number
    await act(async () => {
      fireEvent.change(input, { target: { value: "123456789012345" } });
      await vi.runAllTimersAsync();
    });

    expect(actionHandler).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
