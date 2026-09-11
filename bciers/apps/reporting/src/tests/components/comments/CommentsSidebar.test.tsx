import { act, fireEvent, render, screen } from "@testing-library/react";
import CommentsSidebar from "@reporting/src/app/components/comments/CommentsSidebar";
import * as NewThreadComponentModule from "@reporting/src/app/components/comments/NewThreadComponent";

describe("The Comments Sidebar", () => {
  it("shows a comments title and a new comment button", () => {
    render(<CommentsSidebar version_id={42} threads={[]} facilities={[]} />);

    expect(screen.getByRole("heading", { name: "Comments" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Add internal Comment" }),
    ).toBeVisible();
  });

  it("renders the new thread component when pressing new comment", () => {
    render(<CommentsSidebar version_id={42} threads={[]} facilities={[]} />);

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

    render(<CommentsSidebar version_id={42} threads={[]} facilities={[]} />);
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
});
