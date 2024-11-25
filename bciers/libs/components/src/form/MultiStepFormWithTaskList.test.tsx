import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MultiStepFormWithTaskList from "./MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { RJSFSchema } from "@rjsf/utils";

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

const schema: RJSFSchema = {
  type: "object",
  properties: {
    name: { type: "string", title: "Name" },
    age: { type: "number", title: "Age" },
  },
};

const uiSchema: RJSFSchema = {};

const formData = {
  name: "Test User",
  age: 30,
};

const mockOnSubmit = vi.fn(async () => {});

describe("MultiStepFormWithTaskList", () => {
  it("renders form with task list and submit button", () => {
    render(
      <MultiStepFormWithTaskList
        initialStep={0}
        steps={["Step 1", "Step 2", "Step 3"]}
        taskListElements={taskListElements}
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={mockOnSubmit}
        continueUrl="www.test.com/continue"
      />,
    );

    // Verify task list is rendered
    expect(screen.getByText("Step 1")).toBeVisible();
    expect(screen.getByText("Step 2")).toBeVisible();
    expect(screen.getByText("Step 3")).toBeVisible();

    // Verify form fields are rendered
    expect(screen.getByLabelText("Name")).toBeVisible();
    expect(screen.getByLabelText("Age")).toBeVisible();

    // Verify save button from reportingStepButton component is present
    expect(screen.getByRole("button", { name: "Save" })).toBeVisible();
  });

  it("handles form submission", async () => {
    render(
      <MultiStepFormWithTaskList
        initialStep={0}
        steps={["Step 1", "Step 2", "Step 3"]}
        taskListElements={taskListElements}
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={mockOnSubmit}
        continueUrl="www.test.com/continue"
      />,
    );

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Updated User" },
    });
    fireEvent.change(screen.getByLabelText("Age"), { target: { value: 35 } });

    // Simulate form submission
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    // Assert that the submission function was called with correct data
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalled());

    // Optionally: check if the "Saving..." message is shown
    // This will depend on how you show the loading state in your component
  });

  it("renders cancel button if cancelUrl is provided", () => {
    render(
      <MultiStepFormWithTaskList
        initialStep={0}
        steps={["Step 1", "Step 2", "Step 3"]}
        taskListElements={taskListElements}
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={mockOnSubmit}
        cancelUrl="http://example.com"
        continueUrl="www.test.com/continue"
      />,
    );

    // Check if the back button is present and has the correct href
    expect(screen.getByRole("button", { name: "Back" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Back" }).closest("a"),
    ).toHaveAttribute("href", "http://example.com");
  });

  it("does not render back button if cancelUrl is not provided", () => {
    render(
      <MultiStepFormWithTaskList
        initialStep={0}
        steps={["Step 1", "Step 2", "Step 3"]}
        taskListElements={taskListElements}
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={mockOnSubmit}
        continueUrl="www.test.com/continue"
      />,
    );

    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
  });
});
