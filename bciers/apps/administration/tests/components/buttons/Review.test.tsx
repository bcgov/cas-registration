import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, vi, beforeEach, it } from "vitest";
import Review from "@/administration/app/components/buttons/Review";
import { Role, Status } from "@bciers/utils/src/enums";

const defaultProps = {
  confirmApproveMessage: "Are you sure you want to approve this application?",
  confirmRejectMessage: "Are you sure you want to decline this application?",
  approvedMessage: "Application approved successfully.",
  declinedMessage: "Application declined successfully.",
  role: Role.REPORTER,
  status: Status.PENDING,
  note: "Test note for review",
  onApprove: vi.fn(),
  onReject: vi.fn(),
};

describe("Review component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders review buttons and note when status is pending and role is not admin", () => {
    render(<Review {...defaultProps} />);

    expect(screen.getByText("Test note for review")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Approve application" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reject application" }),
    ).toBeInTheDocument();
  });

  it("opens confirmation modal and calls onApprove on confirmation", async () => {
    const onApproveMock = vi.fn().mockResolvedValueOnce({});
    render(<Review {...defaultProps} onApprove={onApproveMock} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Approve application" }),
    );

    expect(
      screen.getByText(defaultProps.confirmApproveMessage),
    ).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onApproveMock).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText(defaultProps.approvedMessage),
      ).toBeInTheDocument();
    });
  });

  it("opens confirmation modal and calls onReject on confirmation", async () => {
    const onRejectMock = vi.fn().mockResolvedValueOnce({});
    render(<Review {...defaultProps} onReject={onRejectMock} />);

    fireEvent.click(screen.getByRole("button", { name: "Reject application" }));

    expect(
      screen.getByText(defaultProps.confirmRejectMessage),
    ).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onRejectMock).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText(defaultProps.declinedMessage),
      ).toBeInTheDocument();
    });
  });

  it("displays an error message when onApprove returns a validation error", async () => {
    const onApproveMock = vi.fn().mockResolvedValueOnce({
      validation: {
        errors: [
          {
            key: "Approval failed",
            error: {
              severity: "Error",
              message: "Failed to approve access request.",
            },
          },
        ],
      },
    });

    render(<Review {...defaultProps} onApprove={onApproveMock} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Approve application" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(onApproveMock).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("alert")).toBeVisible();
      expect(
        screen.getByText(/Failed to approve access request\./i),
      ).toBeVisible();
    });

    expect(
      screen.queryByText(defaultProps.approvedMessage),
    ).not.toBeInTheDocument();
  });
});
