import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import CommentsSidebar from "@reporting/src/app/components/comments/CommentsSidebar";
import * as NewThreadComponentModule from "@reporting/src/app/components/comments/NewThreadComponent";
import { actionHandler } from "@bciers/testConfig/mocks";

const userId = "00000000-0000-0000-0000-000000000001";

describe("The Comments Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a comments title and a new comment button", () => {
    render(
      <CommentsSidebar
        userId={userId}
        version_id={42}
        threads={[]}
        facilities={[]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Comments" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Add internal Comment" }),
    ).toBeVisible();
  });

  it("renders the new thread component when pressing new comment", () => {
    render(
      <CommentsSidebar
        userId={userId}
        version_id={42}
        threads={[]}
        facilities={[]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Add internal Comment" }),
    );

    expect(
      screen.getByRole("combobox", { name: "Facility (optional)" }),
    ).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Comment" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Save" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  it("renders existing comment threads", () => {
    render(
      <CommentsSidebar
        userId={userId}
        version_id={42}
        facilities={[]}
        threads={[
          {
            id: 10,
            version_id: 42,
            facility_name: "Facility One",
            comments: [
              {
                id: 11,
                version_id: 42,
                author: "Test Author",
                timestamp: "2026-09-10T12:00:00Z",
                comment: "Existing comment",
                user_id: userId,
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText(/Facility Name:.*Facility One/)).toBeVisible();
    expect(screen.getByText("Test Author")).toBeVisible();
    expect(screen.getByText("Existing comment")).toBeVisible();
    expect(screen.getByRole("button", { name: "Reply" })).toBeVisible();
    expect(screen.getByText(/Report Version ID:.*42/)).toBeVisible();
  });

  it("adds a thread when the callback returns", async () => {
    const newThreadComponentSpy = vi.spyOn(NewThreadComponentModule, "default");

    render(
      <CommentsSidebar
        userId={userId}
        version_id={42}
        threads={[]}
        facilities={[]}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Add internal Comment" }),
    );

    const { onThreadCreated } = newThreadComponentSpy.mock.calls[0][0];
    await act(async () => {
      await onThreadCreated({
        id: 20,
        version_id: 42,
        comments: [
          {
            id: 21,
            version_id: 42,
            author: "New Author",
            timestamp: "2026-09-10T12:01:00Z",
            comment: "New comment",
            user_id: userId,
          },
        ],
      });
    });

    expect(await screen.findByText("New comment")).toBeVisible();
    expect(
      screen.queryByRole("textbox", { name: "Comment" }),
    ).not.toBeInTheDocument();
    newThreadComponentSpy.mockRestore();
  });

  it("preserves the comment and thread when deletion fails", async () => {
    const message = "You do not have permission to delete this comment.";
    actionHandler.mockResolvedValueOnce({ error: message });
    render(
      <CommentsSidebar
        userId={userId}
        version_id={42}
        facilities={[]}
        threads={[
          {
            id: 10,
            version_id: 42,
            facility_name: "Facility One",
            comments: [
              {
                id: 11,
                version_id: 42,
                author: "Test Author",
                timestamp: "2026-09-10T12:00:00Z",
                comment: "Comment 11",
                user_id: userId,
              },
            ],
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete comment" }));

    expect(await screen.findByText("Failed to delete comment.")).toBeVisible();
    expect(screen.getByText("Comment 11")).toBeVisible();
    expect(screen.getByText(/Facility Name:.*Facility One/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Reply" })).toBeVisible();
  });

  it("removes comments on success and removes the thread after its last comment is deleted", async () => {
    actionHandler.mockResolvedValueOnce(200).mockResolvedValueOnce(200);
    render(
      <CommentsSidebar
        userId={userId}
        version_id={42}
        facilities={[]}
        threads={[
          {
            id: 10,
            version_id: 42,
            facility_name: "Facility One",
            comments: [11, 12].map((id) => ({
              id,
              version_id: 42,
              author: "Test Author",
              timestamp: "2026-09-10T12:00:00Z",
              comment: `Comment ${id}`,
              user_id: userId,
            })),
          },
          {
            id: 20,
            version_id: 42,
            facility_name: "Facility Two",
            comments: [
              {
                id: 21,
                version_id: 42,
                author: "Another Author",
                timestamp: "2026-09-10T12:00:00Z",
                comment: "Unaffected comment",
                user_id: "00000000-0000-0000-0000-000000000002",
              },
            ],
          },
        ]}
      />,
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: "Delete comment" })[0],
    );
    await waitFor(() => {
      expect(screen.queryByText("Comment 11")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Comment 12")).toBeVisible();
    expect(screen.getAllByRole("button", { name: "Reply" })).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Delete comment" }));
    await waitFor(() => {
      expect(
        screen.queryByText(/Facility Name:.*Facility One/),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText("Unaffected comment")).toBeVisible();
    expect(screen.getAllByRole("button", { name: "Reply" })).toHaveLength(1);
  });
});
