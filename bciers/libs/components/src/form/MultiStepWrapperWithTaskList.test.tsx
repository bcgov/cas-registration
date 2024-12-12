import { render, screen, fireEvent } from "@testing-library/react";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import MultiStepWrapperWithTaskList from "./MultiStepWrapperWithTaskList";
import { useRouter } from "next/navigation";

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

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("MultiStepFormWithTaskList", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders children with task list and submit button", () => {
    render(
      <MultiStepWrapperWithTaskList
        initialStep={0}
        steps={["Step 1", "Step 2", "Step 3"]}
        taskListElements={taskListElements}
        onSubmit={mockOnSubmit}
        continueUrl={""}
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
      screen.getByRole("button", { name: "Save & Continue" }),
    ).toBeVisible();
  });

  it("handles form submission", async () => {
    render(
      <MultiStepWrapperWithTaskList
        initialStep={0}
        steps={["Step 1", "Step 2", "Step 3"]}
        taskListElements={taskListElements}
        onSubmit={mockOnSubmit}
        continueUrl={""}
      >
        Test
      </MultiStepWrapperWithTaskList>,
    );

    // Simulate click submit
    fireEvent.click(screen.getByRole("button", { name: "Save & Continue" }));
  });

  it("renders cancel button if cancelUrl is provided", () => {
    render(
      <MultiStepWrapperWithTaskList
        initialStep={0}
        steps={["Step 1", "Step 2", "Step 3"]}
        taskListElements={taskListElements}
        onSubmit={mockOnSubmit}
        backUrl="http://example.com"
        continueUrl={""}
      />,
    );

    // Check if the cancel button is present and has the correct href
    const button = screen.getByRole("button", {
      name: /Back/i,
    });

    expect(button).toBeVisible();

    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith(`http://example.com`);
  });

  it("does not render cancel button if cancelUrl is not provided", () => {
    render(
      <MultiStepWrapperWithTaskList
        initialStep={0}
        steps={["Step 1", "Step 2", "Step 3"]}
        taskListElements={taskListElements}
        onSubmit={mockOnSubmit}
        continueUrl={""}
      />,
    );

    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
  });

  it("renders an alternave text for the save button if provided", () => {
    render(
      <MultiStepWrapperWithTaskList
        initialStep={0}
        steps={["Step 1", "Step 2", "Step 3"]}
        taskListElements={taskListElements}
        onSubmit={mockOnSubmit}
        submittingButtonText="Custom Save Text"
        continueUrl={""}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Custom Save Text" }),
    ).toBeVisible();
  });
});
