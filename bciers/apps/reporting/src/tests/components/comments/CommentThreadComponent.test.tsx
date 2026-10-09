import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ThreadComponent from "@reporting/src/app/components/comments/ThreadComponent";
import { actionHandler } from "@bciers/testConfig/mocks";

const userId = "00000000-0000-0000-0000-000000000001";

describe("The comment thread component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays the facility and the list of comments", () => {
    render(
      <ThreadComponent
        onCommentDeleted={vi.fn()}
        userId={userId}
        thread={{
          id: 1,
          version_id: 42,
          facility_name: "Facility One",
          comments: [
            {
              id: 1,
              version_id: 42,
              author: "Bilbo Baggins",
              timestamp: "2026-09-10T12:00:00Z",
              comment: "I am the greatest little hobbit of them all",
              user_id: userId,
            },
            {
              id: 2,
              version_id: 42,
              author: "Frodo Baggins",
              timestamp: "1999-06-22T23:00:00Z",
              comment: "Well, obviously that's not true. It's Sam!",
              user_id: "00000000-0000-0000-0000-000000000002",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText(/Facility Name:.*Facility One/)).toBeVisible();
    expect(screen.getByText("Bilbo Baggins")).toBeVisible();
    expect(
      screen.getByText("I am the greatest little hobbit of them all"),
    ).toBeVisible();
    expect(screen.getByText("Sep 10, 2026 5:00 AM")).toBeVisible();
    expect(screen.getByText("Frodo Baggins")).toBeVisible();
    expect(
      screen.getByText("Well, obviously that's not true. It's Sam!"),
    ).toBeVisible();
    expect(screen.getByText("Jun 22, 1999 4:00 PM")).toBeVisible();
  });

  it("has a non-functional reply button", () => {
    render(
      <ThreadComponent
        onCommentDeleted={vi.fn()}
        userId={userId}
        thread={{
          id: 1,
          version_id: 42,
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

  it("shows a deletion error without removing the comment", async () => {
    const message = "You do not have permission to delete this comment.";
    actionHandler.mockResolvedValueOnce({ error: message });
    const onCommentDeleted = vi.fn();
    render(
      <ThreadComponent
        onCommentDeleted={onCommentDeleted}
        userId={userId}
        thread={{
          id: 10,
          version_id: 42,
          comments: [
            {
              id: 123,
              version_id: 42,
              author: "First Author",
              timestamp: "2026-09-10T12:00:00Z",
              comment: "First comment",
              user_id: userId,
            },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete comment" }));

    expect(await screen.findByText("Failed to delete comment.")).toBeVisible();
    expect(screen.getByText("First comment")).toBeVisible();
    expect(onCommentDeleted).not.toHaveBeenCalled();
    expect(actionHandler).toHaveBeenCalledWith(
      "reporting/v2/comments/123",
      "DELETE",
    );
  });

  it("notifies the parent after a successful deletion", async () => {
    actionHandler.mockResolvedValueOnce(200);
    const onCommentDeleted = vi.fn();
    render(
      <ThreadComponent
        onCommentDeleted={onCommentDeleted}
        userId={userId}
        thread={{
          id: 10,
          version_id: 42,
          comments: [
            {
              id: 123,
              version_id: 42,
              author: "First Author",
              timestamp: "2026-09-10T12:00:00Z",
              comment: "First comment",
              user_id: userId,
            },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete comment" }));

    await waitFor(() => {
      expect(onCommentDeleted).toHaveBeenCalledOnce();
      expect(onCommentDeleted).toHaveBeenCalledWith(10, 123);
    });
    expect(actionHandler).toHaveBeenCalledWith(
      "reporting/v2/comments/123",
      "DELETE",
    );
    expect(screen.getByText("First comment")).toBeVisible();
  });

  it("renders updated thread props without keeping a stale local copy", () => {
    const onCommentDeleted = vi.fn();
    const { rerender } = render(
      <ThreadComponent
        thread={{
          id: 10,
          version_id: 42,
          comments: [
            {
              id: 123,
              version_id: 42,
              author: "First Author",
              timestamp: "2026-09-10T12:00:00Z",
              comment: "First comment",
              user_id: userId,
            },
          ],
        }}
        userId={userId}
        onCommentDeleted={onCommentDeleted}
      />,
    );

    expect(screen.getByText("First comment")).toBeVisible();

    rerender(
      <ThreadComponent
        thread={{
          id: 10,
          version_id: 42,
          comments: [],
        }}
        userId={userId}
        onCommentDeleted={onCommentDeleted}
      />,
    );

    expect(screen.queryByText("First comment")).not.toBeInTheDocument();
  });
});
