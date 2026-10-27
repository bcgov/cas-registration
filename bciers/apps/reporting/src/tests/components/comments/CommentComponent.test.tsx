import { render, screen } from "@testing-library/react";
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
    render(<CommentComponent comment={comment} />);

    expect(screen.getByText("Yet you stand before me.")).toBeInTheDocument();
    expect(screen.getByText("The Pagemaster")).toBeInTheDocument();
  });

  it("styles text as resolved when inside a resolved thread frame", () => {
    render(
      <div className="resolved group">
        <CommentComponent
          comment={{ id: 1, version_id: 1, author: "A", comment: "Done" }}
        />
      </div>,
    );

    expect(screen.getByText("Done")).toHaveClass(
      "group-[.resolved]:text-bc-component-grey",
    );
  });
});
