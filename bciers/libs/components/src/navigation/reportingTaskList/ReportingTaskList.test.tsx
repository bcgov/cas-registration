import { render, screen } from "@testing-library/react";
import { TaskListElement } from "./types";
import ReportingTaskList from "./ReportingTaskList";

describe("The Reporting task list component", () => {
  it("Renders a task list with all the nested items", () => {
    const testData: TaskListElement[] = [
      {
        type: "Page",
        title: "main page element",
      },
      {
        type: "Section",
        title: "Facility 1 info",
        elements: [
          { type: "Page", title: "Review information", isChecked: true },
          {
            type: "Subsection",
            title: "Activities information",
            isExpanded: true,
            elements: [
              {
                type: "Page",
                title: "General stationary combustion excluding line tracing",
              },
              { type: "Page", title: "Mobile combustion", isActive: true },
              { type: "Page", title: "...", isChecked: true },
            ],
          },
          { type: "Page", title: "Non-attributable emissions" },
        ],
      },
      {
        type: "Section",
        title: "Facility 2 info",
        elements: [
          { type: "Page", title: "Review facility 2" },
          { type: "Page", title: "..." },
        ],
      },
      {
        type: "Section",
        title: "Facility 3 info",
        isChecked: true,
        elements: [
          { type: "Page", title: "Review ..." },
          { type: "Page", title: "..." },
        ],
      },
      { type: "Page", title: "New entrant information", isChecked: true },
      { type: "Page", title: "Operation emission summary with a long title" },
    ];

    render(<ReportingTaskList elements={testData} />);

    expect(screen.getByText("main page element")).toBeInTheDocument();
    expect(screen.getByText("Facility 1 info")).toBeInTheDocument();
    expect(screen.getByText("Facility 2 info")).toBeInTheDocument();
    expect(screen.getByText("Facility 3 info")).toBeInTheDocument();
    expect(screen.getByText("Review facility 2")).not.toBeVisible(); // collapsed
    expect(screen.getByText("General stationary combustion")).toBeVisible(); // expanded
  });
});
