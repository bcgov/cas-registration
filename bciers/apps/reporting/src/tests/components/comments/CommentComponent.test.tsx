import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    render(
      <CommentComponent
        comment={comment}
        handleDelete={vi.fn()}
        handleEdit={vi.fn()}
        canUpdate={true}
      />,
    );

    expect(screen.getByText("Yet you stand before me.")).toBeInTheDocument();
    expect(screen.getByText("The Pagemaster")).toBeInTheDocument();
  });

  it("styles text as resolved when inside a resolved thread frame", () => {
    render(
      <div className="resolved group">
        <CommentComponent
          comment={{ id: 1, version_id: 1, author: "A", comment: "Done" }}
          handleDelete={vi.fn()}
          handleEdit={vi.fn()}
          canUpdate={true}
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
        comment={{
          id: 1,
          version_id: 1,
          author: "A",
          comment: "Keep me",
          user_can_edit: false,
        }}
        handleDelete={vi.fn()}
        handleEdit={vi.fn()}
        canUpdate={true}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Delete comment" }),
    ).not.toBeInTheDocument();
  });

  it("does not show a delete button when canUpdate is false", () => {
    render(
      <CommentComponent
        comment={{
          id: 1,
          version_id: 1,
          author: "A",
          comment: "Keep me",
          user_can_edit: true,
        }}
        handleDelete={vi.fn()}
        handleEdit={vi.fn()}
        canUpdate={false}
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
        handleEdit={vi.fn()}
        canUpdate={true}
      />,
    );

    const deleteButton = screen.getByRole("button", {
      name: "Delete comment",
    });
    expect(deleteButton).toBeVisible();

    fireEvent.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith(1, 7);
  });

  const editableComment = {
    id: 7,
    version_id: 1,
    author: "An Author",
    comment: "Original text",
    user_can_edit: true,
  };

  it("shows a prefilled text field with save and cancel buttons when clicking the edit button", () => {
    render(
      <CommentComponent
        comment={editableComment}
        handleDelete={vi.fn()}
        handleEdit={vi.fn()}
        canUpdate={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit comment" }));

    expect(screen.getByRole("textbox", { name: "Edit comment" })).toHaveValue(
      "Original text",
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    // Save is disabled until the text is changed
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    // The edit and delete icons are hidden while editing
    expect(
      screen.queryByRole("button", { name: "Edit comment" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete comment" }),
    ).not.toBeInTheDocument();
  });

  it("discards the draft and restores the comment when clicking cancel", () => {
    const handleEdit = vi.fn();
    render(
      <CommentComponent
        comment={editableComment}
        handleDelete={vi.fn()}
        handleEdit={handleEdit}
        canUpdate={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit comment" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Edit comment" }), {
      target: { value: "Changed text" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(handleEdit).not.toHaveBeenCalled();
    expect(screen.getByText("Original text")).toBeVisible();
    expect(
      screen.queryByRole("textbox", { name: "Edit comment" }),
    ).not.toBeInTheDocument();

    // Re-opening the editor shows the saved comment, not the discarded draft
    fireEvent.click(screen.getByRole("button", { name: "Edit comment" }));
    expect(screen.getByRole("textbox", { name: "Edit comment" })).toHaveValue(
      "Original text",
    );
  });

  it("calls handleEdit and exits edit mode when saving succeeds", async () => {
    // Defer resolving the response so the in-flight state can be asserted
    let resolveEdit: (value: boolean) => void;
    const handleEdit = vi.fn().mockReturnValueOnce(
      new Promise((resolve) => {
        resolveEdit = resolve;
      }),
    );
    render(
      <CommentComponent
        comment={editableComment}
        handleDelete={vi.fn()}
        handleEdit={handleEdit}
        canUpdate={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit comment" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Edit comment" }), {
      target: { value: "Changed text" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(handleEdit).toHaveBeenCalledWith(1, 7, "Changed text");
    // While awaiting the response, the buttons are disabled
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled(),
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    resolveEdit!(true);

    await waitFor(() =>
      expect(
        screen.queryByRole("textbox", { name: "Edit comment" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("stays in edit mode and keeps the draft when saving fails", async () => {
    const handleEdit = vi.fn().mockResolvedValueOnce(false);
    render(
      <CommentComponent
        comment={editableComment}
        handleDelete={vi.fn()}
        handleEdit={handleEdit}
        canUpdate={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit comment" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Edit comment" }), {
      target: { value: "Changed text" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Save" })).toBeEnabled(),
    );
    expect(screen.getByRole("textbox", { name: "Edit comment" })).toHaveValue(
      "Changed text",
    );
  });
});
