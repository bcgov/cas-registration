import { act, fireEvent, render, screen } from "@testing-library/react";
import NewThreadComponent from "@reporting/src/app/components/comments/NewThreadComponent";
import postCommentThread from "@reporting/src/app/utils/postCommentThread";

vi.mock("@reporting/src/app/utils/postCommentThread", () => ({
  default: vi.fn(),
}));

const mockPostCommentThread = postCommentThread as ReturnType<typeof vi.fn>;

describe("The new comment thread component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the new thread component with a facility list, a comment box and save/cancel buttons", () => {
    render(
      <NewThreadComponent
        version_id={42}
        facilities={[
          {
            facility_id: "00000000-0000-0000-0000-000000000001",
            facility_name: "Facility One",
          },
          {
            facility_id: "00000000-0000-0000-0000-000000000002",
            facility_name: "Facility Two",
          },
        ]}
        onCancel={vi.fn()}
        onThreadCreated={vi.fn()}
      />,
    );

    expect(screen.getByText(/Report Version ID:.*42/)).toBeVisible();
    const facilitySelect = screen.getByRole("combobox", {
      name: "Facility (optional)",
    });
    expect(facilitySelect).toBeVisible();
    fireEvent.mouseDown(facilitySelect);
    expect(screen.getByRole("option", { name: "Facility One" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Facility Two" })).toBeVisible();
    fireEvent.click(screen.getByRole("option", { name: "Facility One" }));
    expect(screen.getByRole("textbox", { name: "Comment" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Save" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  it("calls onCancel on pressing the cancel button", () => {
    const onCancel = vi.fn();

    render(
      <NewThreadComponent
        version_id={42}
        facilities={[]}
        onCancel={onCancel}
        onThreadCreated={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onThreadCreated on pressing the save button with the result of the post request", async () => {
    const onThreadCreated = vi.fn();

    mockPostCommentThread.mockReturnValueOnce("test return value");

    render(
      <NewThreadComponent
        version_id={42}
        facilities={[
          {
            facility_id: "10000000-0000-0000-0000-000000000001",
            facility_name: "Facility A Million",
          },
        ]}
        onCancel={vi.fn()}
        onThreadCreated={onThreadCreated}
      />,
    );

    fireEvent.mouseDown(
      screen.getByRole("combobox", { name: "Facility (optional)" }),
    );
    fireEvent.click(screen.getByRole("option", { name: "Facility A Million" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Comment" }), {
      target: { value: "A new comment" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });

    expect(mockPostCommentThread).toHaveBeenCalledExactlyOnceWith(
      42,
      "A new comment",
      "10000000-0000-0000-0000-000000000001",
    );

    expect(onThreadCreated).toHaveBeenCalledExactlyOnceWith(
      "test return value",
    );
  });

  it("displays an error when trying to submit an empty comment", () => {
    render(
      <NewThreadComponent
        version_id={42}
        facilities={[]}
        onCancel={vi.fn()}
        onThreadCreated={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText(/Comment cannot be empty/)).toBeVisible();
  });
});
