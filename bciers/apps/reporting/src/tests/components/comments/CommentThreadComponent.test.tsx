import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ThreadComponent from "@reporting/src/app/components/comments/ThreadComponent";
import postComment from "@reporting/src/app/utils/postComment";

vi.mock("@reporting/src/app/utils/postComment", () => ({
  default: vi.fn(),
}));

const mockPostComment = vi.mocked(postComment);

describe("The comment thread component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays the facility and the list of comments", () => {
    render(
      <ThreadComponent
        version_id={42}
        initialThread={{
          id: 1,
          version_id: 42,
          facility_name: "Facility One",
          comments: [
            {
              id: 1,
              version_id: 42,
              author: "First Author",
              timestamp: "2026-09-10T12:00:00Z",
              comment: "First comment",
              user_id: "00000000-0000-0000-0000-000000000001",
            },
            {
              id: 2,
              version_id: 42,
              author: "Second Author",
              timestamp: "1999-06-22T23:00:00Z",
              comment: "Second comment",
              user_id: "00000000-0000-0000-0000-000000000002",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText(/Facility Name:.*Facility One/)).toBeVisible();
    expect(screen.getByText("First Author")).toBeVisible();
    expect(screen.getByText("First comment")).toBeVisible();
    expect(screen.getByText("Sep 10, 2026 5:00 AM")).toBeVisible();
    expect(screen.getByText("Second Author")).toBeVisible();
    expect(screen.getByText("Second comment")).toBeVisible();
    expect(screen.getByText("Jun 22, 1999 4:00 PM")).toBeVisible();
  });

  it("does not submit an empty reply", () => {
    render(
      <ThreadComponent
        version_id={42}
        initialThread={{
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
    expect(mockPostComment).not.toHaveBeenCalled();
  });

  it("displays the reply after submitting and clears the comment box", async () => {
    mockPostComment.mockResolvedValueOnce({
      id: 1,
      version_id: 42,
      comments: [
        {
          id: 2,
          version_id: 42,
          comment: "New comment",
          author: "New Author",
          user_id: "00000000-0000-0000-0000-000000000001",
        },
      ],
    });

    render(
      <ThreadComponent
        version_id={42}
        initialThread={{ id: 1, version_id: 42, comments: [] }}
      />,
    );

    const commentBox = screen.getByRole("textbox", { name: "Comment" });
    fireEvent.change(commentBox, { target: { value: "New comment" } });
    expect(commentBox).toHaveValue("New comment");

    fireEvent.click(screen.getByRole("button", { name: "Reply" }));

    await waitFor(() => {
      expect(commentBox).toHaveValue("");
    });
    expect(mockPostComment).toHaveBeenCalledExactlyOnceWith(
      42,
      "New comment",
      1,
    );
    expect(screen.getByText("New comment")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    expect(mockPostComment).toHaveBeenCalledOnce();
  });
});
