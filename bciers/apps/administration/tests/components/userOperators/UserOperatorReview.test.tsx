import { render, screen, waitFor } from "@testing-library/react";
import UserOperatorReview from "@/administration/app/components/userOperators/UserOperatorReview";
import userEvent from "@testing-library/user-event";
import { UserOperatorStatus } from "@bciers/utils/src/enums";
import { actionHandler } from "@bciers/testConfig/mocks";

describe("UserOperatorReview component", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });
  it("renders the component", () => {
    render(
      <UserOperatorReview
        // @ts-ignore
        userOperator={{ status: UserOperatorStatus.PENDING }}
        userOperatorId="1b06e328-715d-4642-b403-3392256d7344"
      />,
    );

    // note: the button text is different from its role
    expect(
      screen.getByRole("button", { name: "Approve application" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Reject application" }),
    ).toBeVisible();
  });

  it("approves the prime admin when the user clicks approve", async () => {
    actionHandler.mockResolvedValueOnce({});

    render(
      <UserOperatorReview
        userOperatorId="1b06e328-715d-4642-b403-3392256d7344"
        // @ts-ignore
        userOperator={{ status: UserOperatorStatus.PENDING }}
      />,
    );

    await userEvent.click(screen.getByText(/Approve/i));
    await waitFor(() => {
      expect(
        screen.getByText(
          /Are you sure you want to approve the prime admin request?/,
        ),
      ).toBeVisible();
    });
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));
    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/user-operators/1b06e328-715d-4642-b403-3392256d7344/status",
        "PATCH",
        "",
        {
          body: JSON.stringify({ role: "admin", status: "Approved" }),
        },
      );
      expect(
        screen.getByText(/You have approved the prime admin request./i),
      ).toBeVisible();
    });
  });

  it("declines the prime admin when the user clicks decline", async () => {
    actionHandler.mockResolvedValueOnce({});

    render(
      <UserOperatorReview
        userOperatorId="1b06e328-715d-4642-b403-3392256d7344"
        // @ts-ignore
        userOperator={{ status: UserOperatorStatus.PENDING }}
      />,
    );

    await userEvent.click(screen.getByText(/Decline/i));
    await waitFor(() => {
      expect(
        screen.getByText(
          /Are you sure you want to decline the prime admin request?/,
        ),
      ).toBeVisible();
    });
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));
    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/user-operators/1b06e328-715d-4642-b403-3392256d7344/status",
        "PATCH",
        "",
        {
          body: JSON.stringify({ role: "admin", status: "Declined" }),
        },
      );
      expect(
        screen.getByText(/You have declined the prime admin request./i),
      ).toBeVisible();
    });
  });
});
