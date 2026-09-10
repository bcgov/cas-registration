import { fireEvent, render, screen } from "@testing-library/react";
import ThreadComponent from "@reporting/src/app/components/comments/ThreadComponent";

describe("The comment thread component", () => {
  it("displays the facility and the list of comments", () => {
    render(
      <ThreadComponent
        thread={{
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
            },
            {
              id: 2,
              version_id: 42,
              author: "Second Author",
              timestamp: "2026-09-10T13:00:00Z",
              comment: "Second comment",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText(/Facility Name:.*Facility One/)).toBeVisible();
    expect(screen.getByText("First Author")).toBeVisible();
    expect(screen.getByText("First comment")).toBeVisible();
    expect(screen.getByText("2026-09-10T12:00:00Z")).toBeVisible();
    expect(screen.getByText("Second Author")).toBeVisible();
    expect(screen.getByText("Second comment")).toBeVisible();
    expect(screen.getByText("2026-09-10T13:00:00Z")).toBeVisible();
  });

  it("has a non-functional reply button", () => {
    render(
      <ThreadComponent
        thread={{
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
});
