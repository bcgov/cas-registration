import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import SectionTaskListItem from "./SectionTaskListItem";
import { TaskListElement } from "../types";

describe("The Section task list item", () => {
  it("displays the title", () => {
    const item: TaskListElement = {
      type: "Section",
      title: "Test section title",
    };

    render(<SectionTaskListItem item={item} elementFactory={vi.fn()} />);
    expect(screen.getByText("Test section title")).toBeInTheDocument();
  });

  it("renders a checkmark if required", () => {
    const item: TaskListElement = {
      type: "Section",
      title: "Test title",
      isChecked: true,
    };

    const { container } = render(
      <SectionTaskListItem item={item} elementFactory={vi.fn()} />,
    );

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders the nested items with the factory", () => {
    const mockFactory = vi.fn().mockReturnValue(() => <div>test</div>);
    const item: any = {
      type: "Section",
      title: "Test title",
      elements: [
        { type: "Page", title: "title" },
        { type: "Page", title: "title2" },
        { type: "Section", title: "title3" },
      ],
    };

    render(<SectionTaskListItem item={item} elementFactory={mockFactory} />);
    expect(mockFactory).toHaveBeenNthCalledWith(1, item.elements[0]);
    expect(mockFactory).toHaveBeenNthCalledWith(2, item.elements[1]);
    expect(mockFactory).toHaveBeenNthCalledWith(3, item.elements[2]);
  });

  it("starts collapsed if no item is marked expanded", () => {
    const mockFactory = vi
      .fn()
      .mockReturnValue(() => <div>some text here</div>);
    const item: TaskListElement = {
      type: "Section",
      title: "Test title",
      elements: [
        { type: "Page", title: "title" },
        { type: "Page", title: "title2" },
        { type: "Section", title: "title3" },
      ],
    };

    render(<SectionTaskListItem item={item} elementFactory={mockFactory} />);
    expect(screen.getAllByText("some text here")[0]).not.toBeVisible();
  });

  it("starts expanded if one item is marked expanded", () => {
    const mockFactory = vi
      .fn()
      .mockReturnValue(() => <div>some text here</div>);
    const item: TaskListElement = {
      type: "Section",
      title: "Test title",
      elements: [
        { type: "Page", title: "title", isExpanded: true },
        { type: "Page", title: "title2" },
        { type: "Section", title: "title3" },
      ],
    };

    render(<SectionTaskListItem item={item} elementFactory={mockFactory} />);
    expect(screen.getAllByText("some text here")[0]).toBeVisible();
  });

  it("collapses or expands on click", async () => {
    const mockFactory = vi
      .fn()
      .mockReturnValue(() => <div>some text here</div>);
    const item: TaskListElement = {
      type: "Section",
      title: "Test title",
      isExpanded: false,
      elements: [
        { type: "Page", title: "title" },
        { type: "Page", title: "title2" },
        { type: "Section", title: "title3" },
      ],
    };

    render(<SectionTaskListItem item={item} elementFactory={mockFactory} />);
    expect(screen.getAllByText("some text here")[0]).not.toBeVisible();

    // The click actions trigger an animation on the Mui nested list component.
    // We just wait for that animation to finish
    await act(() => {
      screen.getByText("Test title").click();
    });
    await waitFor(() =>
      expect(screen.getAllByText("some text here")[0]).toBeVisible(),
    );

    await act(() => {
      screen.getByText("Test title").click();
    });
    await waitFor(() =>
      expect(screen.getAllByText("some text here")[0]).not.toBeVisible(),
    );
  });
});
