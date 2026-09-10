import { fireEvent, render, screen } from "@testing-library/react";
import NewThreadComponent from "@reporting/src/app/components/comments/NewThreadComponent";

describe("The new comment thread component", () => {
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

  it("calls onThreadCreated on pressing the save button", () => {
    const onThreadCreated = vi.fn();

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
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onThreadCreated).toHaveBeenCalledWith(
      "A new comment",
      "10000000-0000-0000-0000-000000000001",
    );
  });
});
