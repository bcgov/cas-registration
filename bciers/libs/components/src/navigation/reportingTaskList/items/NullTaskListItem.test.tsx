import { render as rtlRender, screen } from "@testing-library/react";
import NullTaskListItem from "./NullTaskListItem";

// Items are <li>s, so render them inside a list as ReportingTaskList does
const render = (ui: React.ReactElement) =>
  rtlRender(ui, { wrapper: ({ children }) => <ul>{children}</ul> });

describe("The NullTaskListItem", () => {
  it("Renders an error message based on the item passed in", () => {
    render(
      <NullTaskListItem
        item={{ type: "Invalid" } as any}
        elementFactory={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Error: Type not found Invalid"),
    ).toBeInTheDocument();
  });
});
