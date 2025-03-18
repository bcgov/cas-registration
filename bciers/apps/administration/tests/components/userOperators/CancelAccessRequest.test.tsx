import { UUID } from "crypto";
import { render, screen } from "@testing-library/react";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";
import CancelAccessRequest from "@/administration/app/components/buttons/CancelAccessRequest";
import { UserOperatorJSON } from "@/administration/tests/components/userOperators/constants";
import userEvent from "@testing-library/user-event";

const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

describe("Cancel Access Requests component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Cancel Access Requests component", () => {
    render(
      <CancelAccessRequest userOperatorId={UserOperatorJSON.id as UUID} />,
    );
    expect(
      screen.getByRole("button", { name: "Cancel Access Request" }),
    ).toBeVisible();
  });

  it("should allow the user to cancel the request", async () => {
    render(
      <CancelAccessRequest userOperatorId={UserOperatorJSON.id as UUID} />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Cancel Access Request" }),
    );
    // make sure the modal is displayed
    expect(
      screen.getByRole("heading", {
        name: /confirmation/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByText(/Are you sure you want to cancel this request\?/i),
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: /No, don't cancel/i,
      }),
    ).toBeVisible();
    expect(screen.getByText(/yes, cancel this request/i)).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: /yes, cancel this request/i }),
    );
    // make sure the action is called
    expect(actionHandler).toHaveBeenCalledWith(
      `registration/user-operators/${UserOperatorJSON.id}`,
      "DELETE",
      "",
    );
    // make sure the user is redirected to the select operator page
    expect(mockRouterPush).toHaveBeenCalledWith("/select-operator");
  });
  it("shows an error message if the request fails", async () => {
    actionHandler.mockResolvedValueOnce({ error: "Failed to cancel request" });
    render(
      <CancelAccessRequest userOperatorId={UserOperatorJSON.id as UUID} />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Cancel Access Request" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /yes, cancel this request/i }),
    );
    expect(screen.getByText(/Failed to cancel request/i)).toBeVisible();
  });
});
