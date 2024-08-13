import { fireEvent, render, screen } from "@testing-library/react";

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

// See SingleStepTaskListForm.test.tsx for TaskList integration test
describe("the TaskList component", () => {
  it("should render successfully", () => {
    render(<TaskList taskListItems={taskListItems} />);

    expect(screen.getByRole("button", { name: "Section 1" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Section 2" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Section 3" })).toBeVisible();
  });

  // it("should render with correct status", () => {
  // const taskListItemStatus = {
  //   section1: true,
  //  section2: false,
  //  section3: false,
  //};

  //render(
  // <TaskList
  //   taskListItems={taskListItems}
  //  taskListItemStatus={taskListItemStatus}
  // />,
  //);

  // expect(screen.getByTestId("section1-tasklist-check")).toContainHTML("svg");
  // expect(screen.getByTestId("section2-tasklist-check")).not.toContainHTML(
  //  "svg",
  //);
  // expect(screen.getByTestId("section3-tasklist-check")).not.toContainHTML(
  //  "svg",
  // );
  //});

  //it("should call handleTaskClick on button click", () => {
  // const taskListItemStatus = {
  //  section1: true,
  //  section2: false,
  //  section3: false,
  // };

  // render(
  //  <TaskList
  //   taskListItems={taskListItems}
  //   taskListItemStatus={taskListItemStatus}
  // />,
  //);

  // const section2Button = screen.getByRole("button", { name: "Section 2" });
  // fireEvent.click(section2Button);

  // expect(section2Button).toHaveClass("bg-[#1a5a960c] border-bc-link-blue");
  //});

  it("should have the correct styles on hover", () => {
    //  const taskListItemStatus = {
    //   section1: true,
    //   section2: false,
    //   section3: false,
    // };

    render(<TaskList taskListItems={taskListItems} />);

    const section2Button = screen.getByRole("button", { name: "Section 2" });
    fireEvent.mouseEnter(section2Button);

    expect(section2Button).toHaveClass("hover:bg-bc-light-grey-200");
  });

  it("should scroll to the correct section on button click", async () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    vi.spyOn(window.HTMLElement.prototype, "scrollIntoView");

    render(
      <div className="h-[200vh]">
        <TaskList taskListItems={taskListItems} />,
        <div className="mt-[100vh]" id="root_section2">
          Section 2
        </div>
      </div>,
    );

    const section2Button = screen.getByRole("button", { name: "Section 2" });

    expect(window.HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();

    fireEvent.click(section2Button);

    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });
});
