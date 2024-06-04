import { render, screen } from "@testing-library/react";

import TaskList from "./TaskList";

const taskListItems = [
  {
    section: "section1",
    title: "Section 1",
  },
  {
    section: "section2",
    title: "Section 2",
  },
  {
    section: "section3",
    title: "Section 3",
  },
];

const taskListItemStatus = {
  section1: true,
  section2: false,
  section3: false,
};

describe("the TaskList component", () => {
  it("should render successfully", () => {
    render(<TaskList taskListItems={taskListItems} taskListItemStatus={{}} />);

    expect(screen.getByRole("button", { name: "Section 1" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Section 2" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Section 3" })).toBeVisible();
  });
});
