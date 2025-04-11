import { expect } from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import LogoutWarningModal, { LogoutWarningModalProps } from "@bciers/components/auth/LogoutWarningModal";

describe("LogoutWarningModal", () => {
  const onLogout = vi.fn();
  const onExtendSession = vi.fn();
  const props: LogoutWarningModalProps = {
    initialTimeLeft: 80,
    onExtendSession,
    onLogout,
    showModal: true
  };

  it("renders modal with countdown and content", () => {
    render(<LogoutWarningModal {...props} />);
    expect(screen.getByText("You will be logged out soon")).toBeVisible();
    expect(screen.getByText("For your security, you will be automatically logged out if you are inactive for more than thirty minutes. Any unsaved changes will be lost.")).toBeVisible();
    expect(screen.getByText(/You will be logged out in/)).toBeVisible();
    expect(screen.getByRole("button", { name: /Log Out/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /Stay Logged In/i })).toBeVisible();
  });

  it("formats countdown time correctly", () => {
    render(<LogoutWarningModal {...props} />);
    expect(screen.getByText("1:20")).toBeInTheDocument();
  });

  it("calls onLogout when Log Out button is clicked", async () => {
    render(<LogoutWarningModal {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /Log Out/i }));
    expect(props.onLogout).toHaveBeenCalledTimes(1);
  });

  it("calls onExtendSession when Stay Logged In button is clicked", async () => {
    render(<LogoutWarningModal {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /Stay Logged In/i }));
    expect(props.onExtendSession).toHaveBeenCalledTimes(1);
  });

  it("does not render modal when showModal is false", () => {
    render(<LogoutWarningModal {...props} showModal={false} />);
    expect(screen.queryByText("You will be logged out soon")).not.toBeInTheDocument();
  });
});
