import { render, screen } from "@testing-library/react";
import PageTaskListItem from "./PageTaskListItem";
import { TaskListElement } from "../types";

const mockRouter = {
  push: vi.fn(),
};
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

describe("The Page task list item", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("displays the title", () => {
    const item: TaskListElement = {
      type: "Page",
      title: "Test title",
    };

    const { container } = render(
      <PageTaskListItem item={item} elementFactory={vi.fn()} />,
    );

    expect(screen.getByText("Test title")).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("displays a checkmark if the item has one", () => {
    const item: TaskListElement = {
      type: "Page",
      title: "Test title",
      isChecked: true,
    };

    const { container } = render(
      <PageTaskListItem item={item} elementFactory={vi.fn()} />,
    );

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("navigates to the link on click", () => {
    const item: TaskListElement = {
      type: "Page",
      title: "Test title",
      link: "/path/to/page",
    };

    render(<PageTaskListItem item={item} elementFactory={vi.fn()} />);

    screen.getByText("Test title").click();
    expect(mockRouter.push).toHaveBeenCalledWith("/path/to/page");
  });
});
