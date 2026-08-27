import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import RequestAccessButton from "apps/administration/app/components/buttons/RequestAccessButton";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";
import userEvent from "@testing-library/user-event";

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
      screen.getByRole("button", { name: "Request administrator access" }),
    ).toBeInTheDocument();
  });

  it("renders the button with correct label for non-admin request", () => {
    render(<RequestAccessButton operatorId={1} operatorName="Test Operator" />);
    expect(
      screen.getByRole("button", { name: "Request access" }),
    ).toBeInTheDocument();
  });

  it("calls actionHandler and redirects on successful access request", async () => {
    actionHandler.mockResolvedValueOnce({});
    render(<RequestAccessButton operatorId={1} operatorName="Test Operator" />);
    fireEvent.click(screen.getByRole("button", { name: "Request access" }));

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/operators/1/request-access",
        "POST",
        "",
      );
    });
  });

  it("displays the operator access error with a mailto link to the regulator", async () => {
    const errorMessage =
      "Your business BCeID does not have access to this operator. Please contact your operator's administrator to request the correct business BCeID. If this issue persists, please contact";
    actionHandler.mockResolvedValueOnce({
      error: errorMessage,
      validation: {
        message: errorMessage,
        errors: [
          {
            key: "user_error",
            error: {
              severity: "Error",
              message: errorMessage,
            },
          },
        ],
      },
    });
    render(<RequestAccessButton operatorId={1} operatorName="Test Operator" />);
    fireEvent.click(screen.getByRole("button", { name: "Request access" }));
    expect(actionHandler).toHaveBeenCalledWith(
      "registration/operators/1/request-access",
      "POST",
      "",
    );
    expect(
      await screen.findByText(
        /Your business BCeID does not have access to this operator/i,
      ),
    ).toBeVisible();
    const mailtoLink = screen.getByRole("link", {
      name: /ghgregulator@gov\.bc\.ca/i,
    });
    expect(mailtoLink).toHaveAttribute(
      "href",
      expect.stringMatching(/^mailto:ghgregulator@gov\.bc\.ca$/i),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("displays an error message when the request fails", async () => {
    const errorMessage = "Unable to request access.";
    actionHandler.mockResolvedValueOnce({
      error: errorMessage,
    });
    render(<RequestAccessButton operatorId={1} operatorName="Test Operator" />);
    await userEvent.click(
      screen.getByRole("button", { name: "Request access" }),
    );
    expect(actionHandler).toHaveBeenCalledWith(
      "registration/operators/1/request-access",
      "POST",
      "",
    );
    expect(await screen.findByText(errorMessage)).toBeVisible();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
