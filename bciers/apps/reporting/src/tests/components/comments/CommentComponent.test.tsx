import { fireEvent, render, screen } from "@testing-library/react";
import CommentComponent from "@reporting/src/app/components/comments/CommentComponent";

describe("The comment component", () => {
  it("renders the component", () => {
    const comment = {
      id: 1,
      version_id: 1,
      author: "The Pagemaster",
      timestamp: "2024-06-01T00:00:00Z",
      comment: "Yet you stand before me.",
    };
    render(<CommentComponent comment={comment} handleDelete={vi.fn()} />);

    expect(screen.getByText("Yet you stand before me.")).toBeInTheDocument();
    expect(screen.getByText("The Pagemaster")).toBeInTheDocument();
  });

  it("styles text as resolved when inside a resolved thread frame", () => {
    render(
      <div className="resolved group">
        <CommentComponent
          comment={{ id: 1, version_id: 1, author: "A", comment: "Done" }}
          handleDelete={vi.fn()}
        />
      </div>,
    );

    expect(screen.getByText("Done")).toHaveClass(
      "group-[.resolved]:text-bc-component-grey",
    );
  });

  it("does not show a delete button when the user cannot edit the comment", () => {
    render(
      <CommentComponent
        comment={{ id: 1, version_id: 1, author: "A", comment: "Keep me" }}
        handleDelete={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Delete comment" }),
    ).not.toBeInTheDocument();
  });

  it("calls handleDelete with the comment id when clicking the delete button", () => {
    const handleDelete = vi.fn();
    render(
      <CommentComponent
        comment={{
          id: 7,
          version_id: 1,
          author: "A",
          comment: "Delete me",
          user_can_edit: true,
        }}
        handleDelete={handleDelete}
      />,
    );

    const deleteButton = screen.getByRole("button", {
      name: "Delete comment",
    });
    expect(deleteButton).toBeVisible();

    fireEvent.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith(1, 7);
  });
});
