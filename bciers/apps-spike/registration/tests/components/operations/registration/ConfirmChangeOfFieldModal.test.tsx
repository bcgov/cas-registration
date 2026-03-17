import { render, screen } from "@testing-library/react";
import ConfirmChangeOfFieldModal from "@/registration/app/components/operations/registration/ConfirmChangeOfFieldModal";
import userEvent from "@testing-library/user-event";

const mockOnCancel = vi.fn();
const mockOnConfirm = vi.fn();

const defaultProps = {
  open: true,
  onCancel: mockOnCancel,
  onConfirm: mockOnConfirm,
  confirmButtonText: "Gloop",
  modalText: "Are you sure you want to change the field?",
};

describe("The ConfirmChangeOfFieldModal component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the modal", () => {
    render(<ConfirmChangeOfFieldModal {...defaultProps} />);
    expect(
      screen.getByText("Are you sure you want to change the field?"),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Gloop" })).toBeVisible();
  });

  it("does not render the modal if open is false", () => {
    render(<ConfirmChangeOfFieldModal {...defaultProps} open={false} />);
    const modalText = screen.queryByText(
      "Are you sure you want to change the field?",
    );
    expect(modalText).toBeNull(); // Ensure the element does not exist
  });

  it("calls onCancel", async () => {
    render(<ConfirmChangeOfFieldModal {...defaultProps} />);
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await userEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("calls onConfirm", async () => {
    render(<ConfirmChangeOfFieldModal {...defaultProps} />);
    const confirmButton = screen.getByRole("button", {
      name: defaultProps.confirmButtonText,
    });
    await userEvent.click(confirmButton);
    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
