import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import RequestAccessButton from "apps/administration/app/components/buttons/RequestAccessButton";

import { actionHandler, useRouter } from "@bciers/testConfig/mocks";

// Mock the dependencies
const mockPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockPush,
});

describe("RequestAccessButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the button with correct label for admin request", () => {
    render(
      <RequestAccessButton
        operatorId={1}
        operatorName="Test Operator"
        isAdminRequest
      />,
    );
    expect(
      screen.getByRole("button", { name: "Request Administrator Access" }),
    ).toBeInTheDocument();
  });

  it("renders the button with correct label for non-admin request", () => {
    render(<RequestAccessButton operatorId={1} operatorName="Test Operator" />);
    expect(
      screen.getByRole("button", { name: "Request Access" }),
    ).toBeInTheDocument();
  });

  it("calls actionHandler and redirects on successful access request", async () => {
    actionHandler.mockResolvedValueOnce({});
    render(<RequestAccessButton operatorId={1} operatorName="Test Operator" />);
    fireEvent.click(screen.getByRole("button", { name: "Request Access" }));

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/v2/operators/1/request-access",
        "POST",
        "",
      );
    });
  });

  it("displays an error message when the access request fails", async () => {
    actionHandler.mockResolvedValueOnce({ error: "Access request failed" });

    render(<RequestAccessButton operatorId={1} operatorName="Test Operator" />);
    fireEvent.click(screen.getByRole("button", { name: "Request Access" }));

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/v2/operators/1/request-access",
        "POST",
        "",
      );
      expect(screen.getByText("Access request failed")).toBeInTheDocument();
    });
  });
});
