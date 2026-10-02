import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
    expect(screen.getByText("Test note for review")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Approve application" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Reject application" }),
    ).toBeVisible();
  });

  it("approves the application after confirmation", async () => {
    const onApproveMock = vi.fn().mockResolvedValueOnce({});
    render(<Review {...defaultProps} onApprove={onApproveMock} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Approve application" }),
    );
    expect(screen.getByText(defaultProps.confirmApproveMessage)).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onApproveMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(defaultProps.approvedMessage)).toBeVisible();
  });

  it("rejects the application after confirmation", async () => {
    const onRejectMock = vi.fn().mockResolvedValueOnce({});
    render(<Review {...defaultProps} onReject={onRejectMock} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Reject application" }),
    );
    expect(screen.getByText(defaultProps.confirmRejectMessage)).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onRejectMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(defaultProps.declinedMessage)).toBeVisible();
  });

  it("displays an error message when the approve request fails", async () => {
    const errorMessage = "Unable to approve application.";
    const onApproveMock = vi.fn().mockResolvedValueOnce({
      error: errorMessage,
    });
    render(<Review {...defaultProps} onApprove={onApproveMock} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Approve application" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onApproveMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(errorMessage)).toBeVisible();
    expect(
      screen.queryByText(defaultProps.approvedMessage),
    ).not.toBeInTheDocument();
  });

  it("displays an error message when the reject request fails", async () => {
    const errorMessage = "Unable to reject application.";
    const onRejectMock = vi.fn().mockResolvedValueOnce({
      error: errorMessage,
    });
    render(<Review {...defaultProps} onReject={onRejectMock} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Reject application" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onRejectMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(errorMessage)).toBeVisible();
    expect(
      screen.queryByText(defaultProps.declinedMessage),
    ).not.toBeInTheDocument();
  });
});
