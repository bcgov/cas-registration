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

  it("displays an error message when the access request fails", async () => {
    actionHandler.mockResolvedValueOnce({
      validation: {
        errors: [
          {
            key: "Access request failed",
            error: { severity: "Error" },
          },
        ],
      },
    });

    render(<RequestAccessButton operatorId={1} operatorName="Test Operator" />);
    fireEvent.click(screen.getByRole("button", { name: "Request access" }));

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/operators/1/request-access",
        "POST",
        "",
      );
      expect(screen.getByText("Access request failed")).toBeInTheDocument();
    });
  });
  it("displays mailto link when user business BCeID lacks operator access", async () => {
    actionHandler.mockResolvedValueOnce({
      validation: {
        errors: [
          {
            key: "no_bceid_access",
            error: {
              severity: "Error",
              message:
                "Your business BCeID does not have access to this operator. Please contact ghgregulator@gov.bc.ca",
            },
          },
        ],
      },
    });

    render(<RequestAccessButton operatorId={1} operatorName="Test Operator" />);
    fireEvent.click(screen.getByRole("button", { name: "Request access" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Your business BCeID does not have access to this operator/i,
        ),
      ).toBeVisible();

      const mailtoLink = screen.getByRole("link", {
        name: "ghgregulator@gov.bc.ca",
      });
      expect(mailtoLink).toBeVisible();
      expect(mailtoLink).toHaveAttribute(
        "href",
        expect.stringMatching(/^mailto:/),
      );
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
