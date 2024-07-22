import { render, screen } from "@testing-library/react";
import NullTaskListItem from "./NullTaskListItem";

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
