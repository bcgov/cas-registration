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
        canUpdate={true}
        onThreadUpdated={vi.fn()}
        onThreadDeleted={vi.fn()}
        version_id={42}
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

  it("displays an error when trying to submit an empty reply", () => {
    render(
      <ThreadComponent
        canUpdate={true}
        onThreadUpdated={vi.fn()}
        onThreadDeleted={vi.fn()}
        version_id={42}
        thread={{
          id: 1,
          version_id: 42,
          resolved: false,
          comments: [],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reply" }));

    expect(screen.getByText(/Comment cannot be empty/)).toBeVisible();
    expect(actionHandler).not.toHaveBeenCalled();
  });

  it("posts the reply, notifies the parent, and clears the field", async () => {
    const thread = { id: 1, version_id: 42, resolved: false, comments: [] };
    const updatedThread = {
      ...thread,
      comments: [
        {
          id: 9,
          version_id: 42,
          author: "An Author",
          comment: "A new reply",
          user_can_edit: true,
        },
      ],
    };
    // Defer resolving the response so the in-flight state can be asserted
    let resolvePost: (value: unknown) => void;
    actionHandler.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );
    const onThreadUpdated = vi.fn();
    render(
      <ThreadComponent
        canUpdate={true}
        onThreadUpdated={onThreadUpdated}
        onThreadDeleted={vi.fn()}
        version_id={42}
        thread={thread}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Comment" }), {
      target: { value: "A new reply" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));

    // While awaiting the response, the reply button is disabled
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Reply" })).toBeDisabled(),
    );
    expect(screen.getByRole("textbox", { name: "Comment" })).toHaveValue(
      "A new reply",
    );
    expect(onThreadUpdated).not.toHaveBeenCalled();

    resolvePost!(updatedThread);

    await waitFor(() =>
      expect(onThreadUpdated).toHaveBeenCalledWith(updatedThread),
    );
    expect(actionHandler).toHaveBeenCalledWith(
      "reporting/v2/report-version/42/threads/1/comments",
      "POST",
      "reports/42/",
      { body: JSON.stringify({ comment: "A new reply" }) },
    );
    expect(screen.getByRole("textbox", { name: "Comment" })).toHaveValue("");
  });

  it("shows an error and keeps the message when posting a reply fails", async () => {
    actionHandler.mockResolvedValueOnce({ error: "Could not post" });
    const onThreadUpdated = vi.fn();
    render(
      <ThreadComponent
        canUpdate={true}
        onThreadUpdated={onThreadUpdated}
        onThreadDeleted={vi.fn()}
        version_id={42}
        thread={{ id: 1, version_id: 42, resolved: false, comments: [] }}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Comment" }), {
      target: { value: "A new reply" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));

    expect(await screen.findByText("Could not post")).toBeVisible();
    expect(onThreadUpdated).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: "Comment" })).toHaveValue(
      "A new reply",
    );
  });
  it("does not show the reply button when canUpdate is false", () => {
    render(
      <ThreadComponent
        canUpdate={false}
        onThreadUpdated={vi.fn()}
        onThreadDeleted={vi.fn()}
        version_id={42}
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
        canUpdate={true}
        version_id={42}
        onThreadUpdated={vi.fn()}
        onThreadDeleted={vi.fn()}
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
          canUpdate={true}
          onThreadUpdated={onThreadUpdated}
          onThreadDeleted={vi.fn()}
          version_id={42}
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
        canUpdate={true}
        onThreadUpdated={onThreadUpdated}
        onThreadDeleted={vi.fn()}
        version_id={42}
        thread={{ id: 1, version_id: 42, resolved: false, comments: [] }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Resolve" }));

    expect(await screen.findByText("Could not resolve")).toBeVisible();
    expect(onThreadUpdated).not.toHaveBeenCalled();
  });

  it("notifies the parent of the updated thread when deleting a comment returns 200", async () => {
    const thread = {
      id: 1,
      version_id: 42,
      resolved: false,
      comments: [
        {
          id: 7,
          version_id: 42,
          author: "An Author",
          comment: "Delete me",
          user_can_edit: true,
        },
        {
          id: 8,
          version_id: 42,
          author: "An Author",
          comment: "But keep me",
          user_can_edit: true,
        },
      ],
    };
    const updatedThread = {
      ...thread,
      comments: [
        {
          id: 8,
          version_id: 42,
          author: "An Author",
          comment: "But keep me",
          user_can_edit: true,
        },
      ],
    };
    actionHandler.mockResolvedValueOnce(updatedThread);
    const onThreadUpdated = vi.fn();
    const onThreadDeleted = vi.fn();
    render(
      <ThreadComponent
        canUpdate={true}
        onThreadUpdated={onThreadUpdated}
        onThreadDeleted={onThreadDeleted}
        thread={thread}
        version_id={42}
      />,
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: "Delete comment" })[0],
    );

    await waitFor(() =>
      expect(onThreadUpdated).toHaveBeenCalledWith(updatedThread),
    );
    expect(onThreadDeleted).not.toHaveBeenCalled();
    expect(actionHandler).toHaveBeenCalledWith(
      "reporting/v2/report-version/42/threads/1/comments/7",
      "DELETE",
    );
  });

  const deletableThread = {
    id: 1,
    version_id: 42,
    resolved: false,
    comments: [
      {
        id: 7,
        version_id: 42,
        author: "An Author",
        comment: "Delete me",
        user_can_edit: true,
      },
    ],
  };

  it("notifies the parent of the deleted thread when deleting a comment returns 204", async () => {
    // A 204 response has no body, so actionHandler resolves it to null
    actionHandler.mockResolvedValueOnce(null);
    const onThreadUpdated = vi.fn();
    const onThreadDeleted = vi.fn();
    render(
      <ThreadComponent
        canUpdate={true}
        onThreadUpdated={onThreadUpdated}
        onThreadDeleted={onThreadDeleted}
        version_id={42}
        thread={deletableThread}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete comment" }));

    await waitFor(() => expect(onThreadDeleted).toHaveBeenCalledWith(1));
    expect(onThreadUpdated).not.toHaveBeenCalled();
  });

  it("shows an error and does not notify the parent when deleting a comment fails", async () => {
    actionHandler.mockResolvedValueOnce({ error: "Could not delete" });
    const onThreadUpdated = vi.fn();
    const onThreadDeleted = vi.fn();
    render(
      <ThreadComponent
        canUpdate={true}
        onThreadUpdated={onThreadUpdated}
        onThreadDeleted={onThreadDeleted}
        version_id={42}
        thread={deletableThread}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete comment" }));

    expect(await screen.findByText("Could not delete")).toBeVisible();
    expect(onThreadUpdated).not.toHaveBeenCalled();
    expect(onThreadDeleted).not.toHaveBeenCalled();
  });

  const editableThread = {
    id: 1,
    version_id: 42,
    resolved: false,
    comments: [
      {
        id: 7,
        version_id: 42,
        author: "An Author",
        comment: "Edit me!",
        user_can_edit: true,
      },
    ],
  };

  it("patches the edited comment and notifies the parent of the updated thread", async () => {
    const updatedThread = {
      ...editableThread,
      comments: [
        { ...editableThread.comments[0], comment: "I've been edited!" },
      ],
    };
    actionHandler.mockResolvedValueOnce(updatedThread);
    const onThreadUpdated = vi.fn();
    render(
      <ThreadComponent
        canUpdate={true}
        onThreadUpdated={onThreadUpdated}
        onThreadDeleted={vi.fn()}
        version_id={42}
        thread={editableThread}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit comment" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Edit comment" }), {
      target: { value: "I've been edited!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(onThreadUpdated).toHaveBeenCalledWith(updatedThread),
    );
    expect(actionHandler).toHaveBeenCalledWith(
      "reporting/v2/report-version/42/threads/1/comments/7",
      "PATCH",
      "reports/42/",
      { body: JSON.stringify({ comment: "I've been edited!" }) },
    );
    expect(
      screen.queryByRole("textbox", { name: "Edit comment" }),
    ).not.toBeInTheDocument();
  });

  it("shows an error and stays in edit mode when editing a comment fails", async () => {
    actionHandler.mockResolvedValueOnce({ error: "Could not edit" });
    const onThreadUpdated = vi.fn();
    render(
      <ThreadComponent
        canUpdate={true}
        onThreadUpdated={onThreadUpdated}
        onThreadDeleted={vi.fn()}
        version_id={42}
        thread={editableThread}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit comment" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Edit comment" }), {
      target: { value: "Changed text" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Could not edit")).toBeVisible();
    expect(onThreadUpdated).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: "Edit comment" })).toHaveValue(
      "Changed text",
    );
  });
});
