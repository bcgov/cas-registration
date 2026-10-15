import { fireEvent, render, screen } from "@testing-library/react";
import { UUID } from "crypto";
import CommentComponent from "@reporting/src/app/components/comments/CommentComponent";
import { Comment } from "@reporting/src/app/components/comments/types";

const userId: UUID = "abcdef12-3456-7890-abcd-ef1234567890";
const comment: Comment = {
  id: 123,
  version_id: 42,
  author: "Test Author",
  timestamp: "2026-09-10T12:00:00Z",
  comment: "Test comment",
  user_id: userId,
};

describe("The comment component", () => {
  it("displays the author, comment text, and timestamp", () => {
    render(
      <CommentComponent
        comment={comment}
        userId={userId}
        handleDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Test Author")).toBeVisible();
    expect(screen.getByText("Test comment")).toBeVisible();
    expect(screen.getByText("Sep 10, 2026 5:00 AM")).toBeVisible();
  });

  it("shows the delete button for the comment author", () => {
    render(
      <CommentComponent
        comment={comment}
        userId={userId}
        handleDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Delete comment" }),
    ).toBeVisible();
  });

  it("hides the delete button for a different user", () => {
    const handleDelete = vi.fn();
    render(
      <CommentComponent
        comment={comment}
        userId="00000000-0000-0000-0000-000000000002"
        handleDelete={handleDelete}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Delete comment" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Test comment")).toBeVisible();
    expect(handleDelete).not.toHaveBeenCalled();
  });

  it("calls the delete handler when delete is clicked", () => {
    const handleDelete = vi.fn();
    render(
      <CommentComponent
        comment={comment}
        userId={userId}
        handleDelete={handleDelete}
      />,
    );

    expect(handleDelete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Delete comment" }));

    expect(handleDelete).toHaveBeenCalledWith(123);
  });
});
