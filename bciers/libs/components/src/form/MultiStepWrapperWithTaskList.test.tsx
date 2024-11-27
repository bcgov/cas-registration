import { render, screen, fireEvent } from "@testing-library/react";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import MultiStepWrapperWithTaskList from "./MultiStepWrapperWithTaskList";

// Mock data for taskListElements
const taskListElements: TaskListElement[] = [
  {
    type: "Section",
    title: "Operation information",
    isExpanded: true,
    elements: [
      { type: "Page", title: "Review Operation information", isActive: true },
      { type: "Page", title: "Person responsible" },
      { type: "Page", title: "Review facilities" },
    ],
  },
];

const mockOnSubmit = vi.fn(async () => {});

describe("MultiStepFormWithTaskList", () => {
  it("renders children with task list and submit button", () => {
    render(
      <MultiStepWrapperWithTaskList
        initialStep={0}
        steps={["Step 1", "Step 2", "Step 3"]}
        taskListElements={taskListElements}
        onSubmit={mockOnSubmit}
      >
        Test Content
      </MultiStepWrapperWithTaskList>,
    );

    // Verify headers are rendered
    expect(screen.getByText("Step 1")).toBeVisible();
    expect(screen.getByText("Step 2")).toBeVisible();
    expect(screen.getByText("Step 3")).toBeVisible();

    // Verify task list is rendered
    expect(screen.getByText("Review Operation information")).toBeVisible();
    expect(screen.getByText("Person responsible")).toBeVisible();
    expect(screen.getByText("Review facilities")).toBeVisible();

    // Verify children are rendered
    expect(screen.getByText("Test Content")).toBeVisible();

    // Verify save button is present
    expect(
      screen.getByRole("button", { name: "Save and Continue" }),
    ).toBeVisible();
  });

  it("handles form submission", async () => {
    render(
      <MultiStepWrapperWithTaskList
        initialStep={0}
        steps={["Step 1", "Step 2", "Step 3"]}
        taskListElements={taskListElements}
        onSubmit={mockOnSubmit}
      >
        Test
      </MultiStepWrapperWithTaskList>,
    );

    // Simulate click submit
    fireEvent.click(screen.getByRole("button", { name: "Save and Continue" }));
  });

  it("renders cancel button if cancelUrl is provided", () => {
    render(
      <MultiStepWrapperWithTaskList
        initialStep={0}
        steps={["Step 1", "Step 2", "Step 3"]}
        taskListElements={taskListElements}
        onSubmit={mockOnSubmit}
        cancelUrl="http://example.com"
      />,
    );

    // Check if the cancel button is present and has the correct href
    expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Cancel" }).closest("a"),
    ).toHaveAttribute("href", "http://example.com");
  });

  it("does not render cancel button if cancelUrl is not provided", () => {
    render(
      <MultiStepWrapperWithTaskList
        initialStep={0}
        steps={["Step 1", "Step 2", "Step 3"]}
        taskListElements={taskListElements}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });

  it("renders an alternave text for the save button if provided", () => {
    render(
      <MultiStepWrapperWithTaskList
        initialStep={0}
        steps={["Step 1", "Step 2", "Step 3"]}
        taskListElements={taskListElements}
        onSubmit={mockOnSubmit}
        saveButtonText="Custom Save Text"
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Custom Save Text" }),
    ).toBeVisible();
  });
});
