import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { actionHandler } from "@bciers/testConfig/mocks";
import ThreadComponent from "@reporting/src/app/components/comments/ThreadComponent";

describe("The comment thread component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays the facility and the list of comments", () => {
    render(
      <ThreadComponent
        canReply={true}
        onThreadUpdated={vi.fn()}
        thread={{
          id: 1,
          version_id: 42,
          facility_name: "Facility One",
          resolved: false,
          comments: [
            {
              id: 1,
              version_id: 42,
              author: "First Author",
              timestamp: "2026-09-10T12:00:00Z",
              comment: "First comment",
            },
            {
              id: 2,
              version_id: 42,
              author: "Second Author",
              timestamp: "1999-06-22T23:00:00Z",
              comment: "Second comment",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("Facility Name:")).toBeVisible();
    expect(screen.getByText("Facility One")).toBeVisible();
    expect(screen.getByText("First Author")).toBeVisible();
    expect(screen.getByText("First comment")).toBeVisible();
    expect(screen.getByText("Sep 10, 2026 5:00 AM")).toBeVisible();
    expect(screen.getByText("Second Author")).toBeVisible();
    expect(screen.getByText("Second comment")).toBeVisible();
    expect(screen.getByText("Jun 22, 1999 4:00 PM")).toBeVisible();
  });

  it("has a non-functional reply button", () => {
    render(
      <ThreadComponent
        canReply={true}
        onThreadUpdated={vi.fn()}
        thread={{
          id: 1,
          version_id: 42,
          resolved: false,
          comments: [],
        }}
      />,
    );

    const replyButton = screen.getByRole("button", { name: "Reply" });
    expect(replyButton).toBeVisible();

    fireEvent.click(replyButton);

    expect(screen.getByRole("button", { name: "Reply" })).toBeVisible();
    expect(screen.queryByText("New comment")).not.toBeInTheDocument();
  });
  it("does not show the reply button when canReply is false", () => {
    render(
      <ThreadComponent
        canReply={false}
        onThreadUpdated={vi.fn()}
        thread={{
          id: 1,
          version_id: 42,
          resolved: false,
          comments: [],
        }}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Reply" }),
    ).not.toBeInTheDocument();
  });

  it("hides the reply button on a resolved thread", () => {
    render(
      <ThreadComponent
        canReply={true}
        onThreadUpdated={vi.fn()}
        thread={{ id: 1, version_id: 42, resolved: true, comments: [] }}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Reply" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unresolve" })).toBeVisible();
  });

  it.each([
    { resolved: false, buttonName: "Resolve", expected: true },
    { resolved: true, buttonName: "Unresolve", expected: false },
  ])(
    "calls the resolve endpoint and notifies the parent when clicking $buttonName",
    async ({ resolved, buttonName, expected }) => {
      actionHandler.mockResolvedValueOnce({ id: 1, resolved: expected });
      const onThreadUpdated = vi.fn();
      const thread = { id: 1, version_id: 42, resolved, comments: [] };
      render(
        <ThreadComponent
          canReply={true}
          onThreadUpdated={onThreadUpdated}
          thread={thread}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: buttonName }));

      await waitFor(() =>
        expect(onThreadUpdated).toHaveBeenCalledWith({
          ...thread,
          resolved: expected,
        }),
      );
      expect(actionHandler).toHaveBeenCalledWith(
        "reporting/v2/report-version/42/threads/1/resolve",
        "PATCH",
        "reports/42/",
        { body: JSON.stringify({ resolved: expected }) },
      );
    },
  );

  it("shows an error and does not notify the parent when resolving fails", async () => {
    actionHandler.mockResolvedValueOnce({ error: "Could not resolve" });
    const onThreadUpdated = vi.fn();
    render(
      <ThreadComponent
        canReply={true}
        onThreadUpdated={onThreadUpdated}
        thread={{ id: 1, version_id: 42, resolved: false, comments: [] }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Resolve" }));

    expect(await screen.findByText("Could not resolve")).toBeVisible();
    expect(onThreadUpdated).not.toHaveBeenCalled();
  });
});
