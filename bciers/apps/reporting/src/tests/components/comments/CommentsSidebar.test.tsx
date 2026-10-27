import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { actionHandler } from "@bciers/testConfig/mocks";
import CommentsSidebar from "@reporting/src/app/components/comments/CommentsSidebar";
import * as NewThreadComponentModule from "@reporting/src/app/components/comments/NewThreadComponent";
import { Thread } from "@reporting/src/app/components/comments/types";

describe("The Comments Sidebar", () => {
  it("shows a comments title and a new comment button", () => {
    render(
      <CommentsSidebar
        version_id={42}
        threads={[]}
        facilities={[]}
        canMakeComment={true}
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
        version_id={42}
        threads={[]}
        facilities={[]}
        canMakeComment={true}
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
        version_id={42}
        facilities={[]}
        canMakeComment={true}
        threads={[
          {
            id: 10,
            version_id: 42,
            facility_name: "Facility One",
            resolved: false,
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

    expect(screen.getByText("Facility Name:")).toBeVisible();
    expect(screen.getByText("Facility One")).toBeVisible();
    expect(screen.getByText("Test Author")).toBeVisible();
    expect(screen.getByText("Existing comment")).toBeVisible();
    expect(screen.getByRole("button", { name: "Reply" })).toBeVisible();
    expect(screen.getByText(/Report Version ID:.*42/)).toBeVisible();
  });

  it("adds a thread when the callback returns", async () => {
    const newThreadComponentSpy = vi.spyOn(NewThreadComponentModule, "default");

    render(
      <CommentsSidebar
        version_id={42}
        threads={[]}
        facilities={[]}
        canMakeComment={true}
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
        resolved: false,
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
  it("does not show the new thread component when canMakeComment is false", () => {
    render(
      <CommentsSidebar
        version_id={42}
        threads={[]}
        facilities={[]}
        canMakeComment={false}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Add internal Comment" }),
    ).not.toBeInTheDocument();
  });

  const makeThread = (id: number, resolved: boolean, comment: string) =>
    ({
      id,
      version_id: 123,
      resolved,
      comments: [{ id, version_id: 123, comment }],
    }) as Thread;

  it("separates open and resolved threads and disables replies on resolved ones", () => {
    render(
      <CommentsSidebar
        version_id={42}
        facilities={[]}
        canMakeComment={true}
        threads={[
          makeThread(1, false, "Open comment"),
          makeThread(2, true, "Resolved comment"),
        ]}
      />,
    );

    const heading = screen.getByText("Resolved Comments");
    const open = screen.getByText("Open comment");
    const resolved = screen.getByText("Resolved comment");
    expect(
      heading.compareDocumentPosition(open) & Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy();
    expect(
      heading.compareDocumentPosition(resolved) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Reply" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Resolve" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Unresolve" })).toHaveLength(
      1,
    );
  });

  it("moves a thread to the resolved section after resolving it", async () => {
    actionHandler.mockResolvedValueOnce({ id: 1, resolved: true });
    render(
      <CommentsSidebar
        version_id={42}
        facilities={[]}
        canMakeComment={true}
        threads={[makeThread(1, false, "Open comment")]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Resolve" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Unresolve" }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: "Reply" }),
    ).not.toBeInTheDocument();
  });

  it("moves a thread back to the open section after unresolving it", async () => {
    actionHandler.mockResolvedValueOnce({ id: 2, resolved: false });
    render(
      <CommentsSidebar
        version_id={42}
        facilities={[]}
        canMakeComment={true}
        threads={[makeThread(2, true, "Resolved comment")]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Unresolve" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Resolve" })).toBeVisible(),
    );
    expect(screen.getByRole("button", { name: "Reply" })).toBeVisible();
  });
});
