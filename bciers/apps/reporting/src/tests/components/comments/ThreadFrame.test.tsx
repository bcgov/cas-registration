import { fireEvent, render, screen } from "@testing-library/react";
import ThreadFrame from "@reporting/src/app/components/comments/ThreadFrame";

describe("The thread frame component", () => {
  it("renders the version id and children without a resolve control when resolved is undefined", () => {
    render(
      <ThreadFrame version_id={42}>
        <span>Child content</span>
      </ThreadFrame>,
    );

    expect(screen.getByText("Internal Comment")).toBeVisible();
    expect(screen.getByText(/Report Version ID:.*42/)).toBeVisible();
    expect(screen.getByText("Child content")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /resolve/i }),
    ).not.toBeInTheDocument();
  });

  it.each([
    { resolved: false, label: "Resolve", expected: true },
    { resolved: true, label: "Unresolve", expected: false },
  ])(
    "shows $label and calls onResolveClicked with $expected",
    ({ resolved, label, expected }) => {
      const onResolveClicked = vi.fn();
      render(
        <ThreadFrame
          version_id={42}
          resolved={resolved}
          onResolveClicked={onResolveClicked}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: label }));

      expect(onResolveClicked).toHaveBeenCalledWith(expected);
    },
  );

  it("applies the resolved class only when resolved", () => {
    const { container, rerender } = render(
      <ThreadFrame version_id={42} resolved={false} />,
    );
    expect(container.querySelector(".resolved")).toBeNull();

    rerender(<ThreadFrame version_id={42} resolved={true} />);
    expect(container.querySelector(".resolved")).not.toBeNull();
  });

  it("does not throw when clicking resolve without a handler", () => {
    render(<ThreadFrame version_id={42} resolved={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Resolve" }));
    expect(screen.getByRole("button", { name: "Resolve" })).toBeVisible();
  });
});
