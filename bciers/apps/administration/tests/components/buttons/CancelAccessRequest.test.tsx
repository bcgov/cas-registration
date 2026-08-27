import { UUID } from "crypto";
import { render, screen } from "@testing-library/react";
import { useRouter } from "@bciers/testConfig/mocks";
import CancelAccessRequest from "@/administration/app/components/buttons/CancelAccessRequest";
import cancelAccessRequest from "@/administration/app/components/userOperators/cancelAccessRequest";
import { UserOperatorJSON } from "@/administration/tests/components/userOperators/constants";
import userEvent from "@testing-library/user-event";

vi.mock(
  "@/administration/app/components/userOperators/cancelAccessRequest",
  () => ({
    default: vi.fn(),
  }),
);

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
    vi.mocked(cancelAccessRequest).mockResolvedValueOnce(true);

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
    // make sure the server action is called
    expect(cancelAccessRequest).toHaveBeenCalledWith(UserOperatorJSON.id);
    // make sure the user is redirected to the select operator page
    expect(mockRouterPush).toHaveBeenCalledWith("/select-operator");
  });

  it("displays an error message when the cancel request fails", async () => {
    const errorMessage = "Unable to cancel access request.";

    vi.mocked(cancelAccessRequest).mockResolvedValueOnce({
      error: errorMessage,
    });

    render(
      <CancelAccessRequest userOperatorId={UserOperatorJSON.id as UUID} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Cancel Access Request" }),
    );

    await userEvent.click(
      screen.getByRole("button", { name: /yes, cancel this request/i }),
    );

    expect(await screen.findByText(errorMessage)).toBeVisible();

    expect(cancelAccessRequest).toHaveBeenCalledTimes(1);
    expect(cancelAccessRequest).toHaveBeenCalledWith(UserOperatorJSON.id);
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("displays an error message when the cancel request throws", async () => {
    const errorMessage = "Internal Server Error";
    // actionHandler DELETE throws
    vi.mocked(cancelAccessRequest).mockRejectedValueOnce(
      new Error(errorMessage),
    );
    render(
      <CancelAccessRequest userOperatorId={UserOperatorJSON.id as UUID} />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Cancel Access Request" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /yes, cancel this request/i }),
    );
    expect(await screen.findByText(errorMessage)).toBeVisible();
    expect(cancelAccessRequest).toHaveBeenCalledTimes(1);
    expect(cancelAccessRequest).toHaveBeenCalledWith(UserOperatorJSON.id);
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
